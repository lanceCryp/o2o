import { NextRequest, NextResponse } from 'next/server';
import { stripe, getSubscriptionPlan } from '@/lib/stripe';

/**
 * 创建 Stripe Subscription Checkout Session
 */
export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle } = await request.json() as { planId: string; billingCycle: 'monthly' | 'yearly' };

    // 验证订阅计划
    const planInfo = getSubscriptionPlan(planId);
    if (!planInfo) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Get user info from Clerk
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取用户邮箱（从 Clerk）
    const clerkClient = await import('@clerk/nextjs/server').then(m => m.clerkClient());
    const user = await clerkClient.users.getUser(userId);
    const customerEmail = user.primaryEmailAddress?.emailAddress || '';

    // 获取应用 URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 获取价格（根据计费周期）
    const price = billingCycle === 'yearly' ? planInfo.yearlyPrice : planInfo.price;

    // 创建 Stripe Checkout Session（订阅模式）
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planInfo.name} - ${billingCycle === 'yearly' ? '年付' : '月付'}`,
              description: billingCycle === 'yearly' ? '年付优惠，省 2 个月费用' : '按月计费',
            },
            unit_amount: price,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/billing?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?subscription_canceled=true`,
      metadata: {
        userId,
        planId,
        billingCycle,
        type: 'subscription',
        customerEmail, // 保存用户邮箱到 metadata
      },
      // 客户信息收集
      billing_address_collection: 'auto',
      customer_email: customerEmail || undefined, // 传入用户邮箱
    });

    if (!session.url) {
      throw new Error('Failed to create subscription session');
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating subscription session:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription session' },
      { status: 500 }
    );
  }
}
