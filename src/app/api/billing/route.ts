import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { userCredits, subscriptions, orders, freeTrials } from '@/drizzle/schema';

/**
 * 获取用户的账单和时长信息
 */
export async function GET(request: NextRequest) {
  try {
    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // Get user info from Clerk
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取用户时长余额
    const creditsList = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    const credits = creditsList[0] || {
      totalMinutes: 0,
      usedMinutes: 0,
      isLifetime: true,
    };

    // 获取免费试用信息
    const freeTrialList = await db.select().from(freeTrials).where(eq(freeTrials.userId, userId)).limit(1);
    const freeTrial = freeTrialList[0];

    // 获取订阅状态
    const subscriptionList = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.startDate))
      .limit(1);

    const subscription = subscriptionList[0];

    // 获取订单历史（最近 10 条）
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return NextResponse.json({
      credits: {
        totalMinutes: credits.totalMinutes,
        usedMinutes: credits.usedMinutes,
        remainingMinutes: credits.totalMinutes - credits.usedMinutes,
        isLifetime: credits.isLifetime,
      },
      freeTrial: freeTrial ? {
        remainingMinutes: freeTrial.remainingMinutes,
        usedMinutes: freeTrial.usedMinutes,
        expiresAt: freeTrial.expiresAt?.toISOString(),
        isExpired: new Date() > freeTrial.expiresAt,
      } : null,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate?.toISOString(),
        endDate: subscription.endDate?.toISOString(),
      } : null,
      orders: orderList.map(order => ({
        id: order.id,
        package: order.package,
        minutes: order.minutes,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    );
  }
}
