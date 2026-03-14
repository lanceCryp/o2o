import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { users, userCredits, orders, subscriptions, emailLogs } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { stripe, getSubscriptionMinutes } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';
import type Stripe from 'stripe';
import { sendPaymentSuccessEmail, sendSubscriptionSuccessEmail } from '@/lib/email';

/**
 * Stripe Webhook - 处理支付事件
 *
 * 需要配置 webhook 端点：
 * 1. 在 Stripe Dashboard 添加 webhook: https://your-domain.com/api/stripe/webhook
 * 2. 选择事件：
 *    - checkout.session.completed (一次性购买和订阅)
 *    - customer.subscription.updated (订阅状态更新)
 *    - customer.subscription.deleted (订阅取消)
 * 3. 或者使用 Stripe CLI 测试：stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // 验证 webhook 签名
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Get Cloudflare context for D1 database
  const cf = getCloudflareContext();
  const db = createDb(cf.env.DB);

  // 处理不同事件
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // 只处理已支付的订单
      if (session.payment_status !== 'paid') {
        break;
      }

      const { userId, planId, packageId, minutes, billingCycle, type, customerEmail } = session.metadata!;
      const amount = session.amount_total!; // 美分

      // 获取用户邮箱（优先从 session 获取，其次从 metadata 获取）
      const email = session.customer_email || customerEmail || '';

      // 生成订单号
      const orderId = uuidv4();

      // 判断是订阅还是一次性购买
      if (type === 'subscription') {
        // 订阅购买
        const minutesPerMonth = getSubscriptionMinutes(planId);

        // 创建订阅记录
        const subscriptionId = uuidv4();
        const startDate = new Date();
        const endDate = billingCycle === 'yearly'
          ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000)
          : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await db.insert(subscriptions).values({
          id: subscriptionId,
          userId,
          plan: planId,
          status: 'active',
          startDate,
          endDate,
        });

        // 添加首月时长到用户账户
        const existingCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

        if (existingCredits.length > 0) {
          await db.update(userCredits).set({
            totalMinutes: existingCredits[0].totalMinutes + minutesPerMonth,
          }).where(eq(userCredits.id, existingCredits[0].id));
        } else {
          await db.insert(userCredits).values({
            id: uuidv4(),
            userId,
            totalMinutes: minutesPerMonth,
            usedMinutes: 0,
            isLifetime: false, // 订阅时长非永久
            createdAt: new Date(),
          });
        }

        // 创建订阅订单记录
        await db.insert(orders).values({
          id: orderId,
          userId,
          stripePaymentIntentId: session.payment_intent as string,
          package: planId,
          minutes: minutesPerMonth,
          amount,
          currency: session.currency || 'usd',
          status: 'succeeded',
          createdAt: new Date(),
        });

        console.log(`Subscription activated for user ${userId}: ${planId} (${billingCycle}), ${minutesPerMonth} minutes/month`);
      } else {
        // 一次性购买时长
        const minutesNum = parseInt(minutes, 10);

        // 创建订单记录
        await db.insert(orders).values({
          id: orderId,
          userId,
          stripePaymentIntentId: session.payment_intent as string,
          package: packageId,
          minutes: minutesNum,
          amount,
          currency: session.currency || 'usd',
          status: 'succeeded',
          createdAt: new Date(),
        });

        // 更新用户时长
        const existingCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

        if (existingCredits.length > 0) {
          await db.update(userCredits).set({
            totalMinutes: existingCredits[0].totalMinutes + minutesNum,
            isLifetime: true,
          }).where(eq(userCredits.id, existingCredits[0].id));
        } else {
          await db.insert(userCredits).values({
            id: uuidv4(),
            userId,
            totalMinutes: minutesNum,
            usedMinutes: 0,
            isLifetime: true,
            createdAt: new Date(),
          });
        }

        console.log(`Payment completed for user ${userId}: ${minutesNum} minutes, $${amount / 100}`);
      }

      // 确保用户存在于数据库中
      await db.insert(users).values({
        id: userId,
        email,
        username: '',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      // 发送支付成功邮件
      if (email) {
        const emailResult = await sendPaymentSuccessEmail(email, {
          minutes: type === 'subscription' ? getSubscriptionMinutes(planId) : parseInt(minutes, 10),
          amount,
          currency: session.currency || 'usd',
          orderId,
        });

        // 记录邮件日志
        if (emailResult) {
          await db.insert(emailLogs).values({
            id: uuidv4(),
            userId,
            type: 'payment_success',
            status: emailResult.success ? 'sent' : 'failed',
            sentAt: new Date(),
            metadata: JSON.stringify({ orderId, emailResult }),
          });
        }
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, planId } = subscription.metadata || {};

      if (!userId) {
        console.log('Subscription update without userId, skipping');
        break;
      }

      // 获取用户邮箱
      const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userList[0];

      // 更新数据库中的订阅状态
      const existingSubList = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

      if (existingSubList.length > 0) {
        const statusMap: Record<string, string> = {
          active: 'active',
          canceled: 'cancelled',
          incomplete: 'pending',
          trialing: 'active',
          past_due: 'pending',
          unpaid: 'cancelled',
        };

        await db.update(subscriptions).set({
          status: statusMap[subscription.status] || 'active',
          endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
        }).where(eq(subscriptions.id, existingSubList[0].id));

        console.log(`Subscription updated for user ${userId}: ${subscription.status}`);

        // 如果是新激活的订阅，发送确认邮件
        if (subscription.status === 'active' && user?.email) {
          const billingCycle = subscription.items.data[0]?.plan.interval || 'monthly';
          const amount = subscription.items.data[0]?.plan.amount || 0;

          const emailResult = await sendSubscriptionSuccessEmail(user.email, {
            plan: planId || subscription.items.data[0]?.plan.nickname || 'Pro',
            billingCycle,
            amount,
            currency: subscription.currency || 'usd',
          });

          if (emailResult) {
            await db.insert(emailLogs).values({
              id: uuidv4(),
              userId,
              type: 'subscription_success',
              status: emailResult.success ? 'sent' : 'failed',
              sentAt: new Date(),
              metadata: JSON.stringify({ emailResult }),
            });
          }
        }
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId } = subscription.metadata || {};

      if (!userId) {
        console.log('Subscription deletion without userId, skipping');
        break;
      }

      // 更新数据库中的订阅状态为已取消
      await db.update(subscriptions).set({
        status: 'cancelled',
        endDate: new Date(),
      }).where(eq(subscriptions.userId, userId));

      console.log(`Subscription cancelled for user ${userId}`);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId } = session.metadata!;

      // 更新订单状态为失败（如果有创建 pending 订单的话）
      console.log(`Checkout session expired for user ${userId}`);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // 查找并更新订单状态
      const orderList = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntent.id)).limit(1);

      if (orderList.length > 0) {
        await db.update(orders).set({
          status: 'failed',
        }).where(eq(orders.id, orderList[0].id));
      }

      console.log(`Payment failed for payment intent ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
