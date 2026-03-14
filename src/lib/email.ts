import { Resend } from 'resend';

// 初始化 Resend 客户端
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

/**
 * 发送支付成功确认邮件
 */
export async function sendPaymentSuccessEmail(
  to: string,
  data: {
    minutes: number;
    amount: number;
    currency: string;
    orderId: string;
  }
) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Payment Successful - o2o',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Payment Successful!</h2>
          <p>Thank you for your purchase. Your minutes have been added to your account.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Minutes Added:</strong> ${data.minutes} min</p>
            <p><strong>Amount Paid:</strong> ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</p>
          </div>

          <p>You can now use these minutes to create private 1-on-1 video calls.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Your Balance
          </a>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for choosing o2o!
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send payment success email:', error);
      return { success: false, error };
    }

    console.log('Payment success email sent:', emailData?.id);
    return { success: true, id: emailData?.id };
  } catch (err) {
    console.error('Error sending payment success email:', err);
    return { success: false, error: err };
  }
}

/**
 * 发送订阅成功确认邮件
 */
export async function sendSubscriptionSuccessEmail(
  to: string,
  data: {
    plan: string;
    billingCycle: string;
    amount: number;
    currency: string;
  }
) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Subscription Activated - ${data.plan} Plan`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Subscription Activated!</h2>
          <p>Your ${data.plan} subscription has been successfully activated.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${data.plan}</p>
            <p><strong>Billing:</strong> ${data.billingCycle}</p>
            <p><strong>Amount:</strong> ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</p>
          </div>

          <p>You can now enjoy all the benefits of your subscription plan.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Subscription
          </a>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for choosing o2o!
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send subscription success email:', error);
      return { success: false, error };
    }

    console.log('Subscription success email sent:', emailData?.id);
    return { success: true, id: emailData?.id };
  } catch (err) {
    console.error('Error sending subscription success email:', err);
    return { success: false, error: err };
  }
}

/**
 * 发送欢迎邮件（新用户注册）
 */
export async function sendWelcomeEmail(
  to: string,
  data: {
    name: string;
    freeTrialMinutes: number;
  }
) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to o2o!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to o2o, ${data.name}!</h2>
          <p>We're excited to have you on board.</p>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d4ed8;">Free Trial Activated</h3>
            <p style="font-size: 24px; font-weight: bold; color: #1d4ed8;">${data.freeTrialMinutes} minutes</p>
            <p style="color: #6b7280;">Your free trial minutes are ready to use!</p>
          </div>

          <p>With o2o, you can:</p>
          <ul>
            <li>Create private 1-on-1 video calls</li>
            <li>Enjoy end-to-end encryption</li>
            <li>No download required - works in any browser</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Start Your First Call
          </a>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Settings</a> page.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent:', emailData?.id);
    return { success: true, id: emailData?.id };
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return { success: false, error: err };
  }
}
