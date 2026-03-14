import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { users, userCredits, orders } from '@/drizzle/schema';
import { stripe, getPackage, PACKAGES } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';

/**
 * 创建 Stripe Checkout Session
 */
export async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json() as { packageId: string };

    // 验证套餐
    const packageInfo = getPackage(packageId);
    if (!packageInfo) {
      return NextResponse.json(
        { error: 'Invalid package' },
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

    // 获取应用 URL（用于支付成功后的跳转）
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageInfo.name,
              description: `${packageInfo.minutes} 分钟通话时长`,
            },
            unit_amount: packageInfo.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: {
        userId,
        packageId,
        minutes: packageInfo.minutes.toString(),
        customerEmail, // 保存用户邮箱到 metadata
      },
      // 客户信息收集
      customer_email: customerEmail || undefined, // 传入用户邮箱，如果为空则让用户输入
      billing_address_collection: 'auto',
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

/**
 * 查询支付会话状态（用于前端轮询）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('Error checking session status:', error);
    return NextResponse.json(
      { error: 'Failed to check session status' },
      { status: 500 }
    );
  }
}
