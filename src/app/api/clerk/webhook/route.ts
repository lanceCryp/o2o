import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { users, userCredits, freeTrials, emailLogs } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * Clerk Webhook - 处理用户注册事件
 *
 * 配置说明：
 * 1. 在 Clerk Dashboard -> Webhooks 添加端点：https://your-domain.com/api/clerk/webhook
 * 2. 选择事件：user.created, user.updated, user.deleted
 * 3. 获取 Clerk Signing Secret 并设置到环境变量：CLERK_WEBHOOK_SECRET
 *
 * 测试：使用 Clerk Dashboard 的 "Send Test Event" 功能
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const clerkSignature = request.headers.get('svix-signature');
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');

    // 验证 webhook 签名（使用 Svix 库）
    if (process.env.CLERK_WEBHOOK_SECRET && clerkSignature && svixId && svixTimestamp) {
      try {
        // 使用 Svix 验证 webhook 签名
        const { Webhook } = await import('svix');
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        wh.verify(body, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': clerkSignature,
        });
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        // 开发环境不严格验证
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
          );
        }
      }
    }

    // 解析事件
    const event = JSON.parse(body);
    const eventType = event.type;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    switch (eventType) {
      case 'user.created': {
        const user = event.data;
        const userId = user.id;
        const email = user.email_addresses?.[0]?.email_address || '';
        const createdAt = new Date(user.created_at);

        console.log(`New user created: ${userId} (${email})`);

        // 确保用户存在于数据库中
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (existingUser.length === 0) {
          await db.insert(users).values({
            id: userId,
            email,
            username: user.username || user.first_name || '',
            avatarUrl: user.image_url || null,
            createdAt,
            updatedAt: new Date(),
          });
        }

        // 创建免费试用时长记录（100 分钟）
        const FREE_TRIAL_MINUTES = parseInt(process.env.FREE_TRIAL_MINUTES || '100');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 天有效期

        const existingTrials = await db.select().from(freeTrials).where(eq(freeTrials.userId, userId)).limit(1);

        if (existingTrials.length === 0) {
          await db.insert(freeTrials).values({
            id: uuidv4(),
            userId,
            remainingMinutes: FREE_TRIAL_MINUTES,
            usedMinutes: 0,
            expiresAt,
          });

          // 同时创建 userCredits 记录，初始为免费试用额度
          await db.insert(userCredits).values({
            id: uuidv4(),
            userId,
            totalMinutes: FREE_TRIAL_MINUTES,
            usedMinutes: 0,
            isLifetime: false, // 试用时长非永久
            createdAt: new Date(),
          });

          console.log(`Free trial created for user ${userId}: ${FREE_TRIAL_MINUTES} minutes, expires ${expiresAt.toISOString()}`);

          // 发送欢迎邮件
          if (email) {
            const emailResult = await sendWelcomeEmail(email, {
              name: user.first_name || user.username || 'User',
              freeTrialMinutes: FREE_TRIAL_MINUTES,
            });

            // 记录邮件日志
            if (emailResult) {
              await db.insert(emailLogs).values({
                id: uuidv4(),
                userId,
                type: 'welcome',
                status: emailResult.success ? 'sent' : 'failed',
                sentAt: new Date(),
                metadata: JSON.stringify({ emailResult }),
              });
            }
          }
        }

        break;
      }

      case 'user.updated': {
        const user = event.data;
        const userId = user.id;

        // 更新用户信息
        await db.update(users).set({
          email: user.email_addresses?.[0]?.email_address || '',
          username: user.username || user.first_name || '',
          avatarUrl: user.image_url || null,
          updatedAt: new Date(),
        }).where(eq(users.id, userId));

        console.log(`User updated: ${userId}`);
        break;
      }

      case 'user.deleted': {
        const userId = event.data.id;

        // 软删除用户（可选：也可以硬删除所有相关数据）
        console.log(`User deleted: ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
