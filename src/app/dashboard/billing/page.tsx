'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';

interface Credits {
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  isLifetime: boolean;
}

interface FreeTrial {
  remainingMinutes: number;
  usedMinutes: number;
  expiresAt?: string;
  isExpired: boolean;
}

interface Subscription {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface Order {
  id: string;
  package: string;
  minutes: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface BillingData {
  credits: Credits;
  freeTrial: FreeTrial | null;
  subscription: Subscription | null;
  orders: Order[];
}

const PACKAGES = [
  {
    id: 'starter',
    minutes: 60,
    price: 299, // cents
    originalPrice: 599,
  },
  {
    id: 'standard',
    minutes: 150,
    price: 599,
    originalPrice: 899,
    badge: 'mostPopular',
  },
  {
    id: 'unlimited',
    minutes: 300,
    price: 999,
    originalPrice: 1499,
  },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'member',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    badge: null,
  },
  {
    id: 'pro',
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    badge: 'mostPopular',
  },
  {
    id: 'enterprise',
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    badge: 'forBusiness',
  },
];

export default function BillingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { t } = useI18n();

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      return;
    }

    // Check URL for payment result parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const subscriptionSuccess = urlParams.get('subscription_success');
    const subscriptionCanceled = urlParams.get('subscription_canceled');

    if (success === 'true') {
      setPurchaseError('');
    } else if (canceled === 'true') {
      setPurchaseError(t('Billing.messages.paymentCanceled'));
    } else if (subscriptionSuccess === 'true') {
      setPurchaseError('');
    } else if (subscriptionCanceled === 'true') {
      setPurchaseError(t('Billing.messages.subscriptionCanceled'));
    }

    fetchBilling();
  }, [isLoaded, isSignedIn]);

  const fetchBilling = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing');
      if (!res.ok) throw new Error('Failed to fetch billing info');
      const data = await res.json() as BillingData;
      setBillingData(data);
    } catch (err) {
      console.error('Failed to fetch billing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    setIsPurchasing(pkg.id);
    setPurchaseError('');
    try {
      // Create Stripe Checkout Session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || t('Billing.messages.purchaseError'));
      }

      const data = await res.json() as { url: string; sessionId: string };

      // Redirect to Stripe Checkout page
      window.location.href = data.url;
    } catch (err) {
      console.error('Failed to purchase:', err);
      setPurchaseError(err instanceof Error ? err.message : t('Billing.messages.purchaseError'));
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleSubscribe = async (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    setIsSubscribing(plan.id);
    setPurchaseError('');
    try {
      // Create Stripe Subscription Session
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, billingCycle }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || t('Billing.messages.subscribeError'));
      }

      const data = await res.json() as { url: string; sessionId: string };

      // Redirect to Stripe Checkout page
      window.location.href = data.url;
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setPurchaseError(err instanceof Error ? err.message : t('Billing.messages.subscribeError'));
    } finally {
      setIsSubscribing(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('Billing.status.active');
      case 'succeeded':
        return t('Billing.status.succeeded');
      case 'pending':
        return t('Billing.status.pending');
      case 'failed':
        return t('Billing.status.failed');
      case 'cancelled':
        return t('Billing.status.cancelled');
      case 'expired':
        return t('Billing.status.expired');
      default:
        return status;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            {t('Common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t('Billing.signInRequired')}</CardTitle>
              <CardDescription>
                {t('Billing.signInToView')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sign-in">
                <Button className="w-full">{t('Common.signIn')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            {t('Common.loading')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* 支付结果提示 */}
          {purchaseError && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{purchaseError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付成功提示 */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === 'true' && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('Billing.messages.paymentSuccess')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 订阅成功提示 */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('subscription_success') === 'true' && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('Billing.messages.subscriptionSuccess')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 免费试用信息 */}
          {billingData?.freeTrial && !billingData.freeTrial.isExpired && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="text-lg">{t('Billing.freeTrial.title')}</CardTitle>
                <CardDescription>{t('Billing.freeTrial.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {billingData.freeTrial.remainingMinutes} {t('Billing.credits.availableMinutes')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('Billing.freeTrial.expiresAt')}: {new Date(billingData.freeTrial.expiresAt!).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-5xl">🎁</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 时长余额 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('Billing.credits.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Billing.credits.availableMinutes')}</CardTitle>
                  <CardDescription>{t('Billing.credits.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {billingData?.credits.remainingMinutes || 0}
                    </span>
                    <span className="text-muted-foreground">{t('Room.duration').split(' ')[1] || '分钟'}</span>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>{t('Billing.credits.totalMinutes')}：{billingData?.credits.totalMinutes || 0} {t('Room.duration').split(' ')[1] || '分钟'}</div>
                    <div>{t('Billing.credits.usedMinutes')}：{billingData?.credits.usedMinutes || 0} {t('Room.duration').split(' ')[1] || '分钟'}</div>
                    {billingData?.credits.isLifetime && (
                      <div className="text-green-600 dark:text-green-400">
                        ✓ {t('Billing.credits.lifetime')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Billing.subscription.title')}</CardTitle>
                  <CardDescription>{t('Billing.subscription.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {billingData?.subscription ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          billingData.subscription.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {getStatusText(billingData.subscription.status)}
                        </span>
                        <span className="font-medium capitalize">
                          {billingData.subscription.plan}
                        </span>
                      </div>
                      {billingData.subscription.startDate && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {t('Pricing.standard.noExpiration').split(' ')[0]}：{formatDate(billingData.subscription.startDate)}
                        </div>
                      )}
                      {billingData.subscription.endDate && (
                        <div className="text-sm text-muted-foreground">
                          {t('Pricing.standard.noExpiration').split(' ')[0]}：{formatDate(billingData.subscription.endDate)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      {t('Billing.subscription.noSubscription')}
                      <div className="text-sm mt-1">
                        {t('Billing.subscription.startWithPackage')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 充值套餐 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('Billing.packages.title')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative overflow-visible ${
                    pkg.badge ? 'border-primary shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap z-10">
                      {t(`Pricing.${pkg.id === 'standard' ? 'standard' : pkg.id}.bestValue`)}
                    </span>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t(`Pricing.${pkg.id}.name`)}</CardTitle>
                    <CardDescription>{t(`Billing.packages.${pkg.id}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold">
                          {formatCurrency(pkg.price)}
                        </span>
                        {pkg.originalPrice > pkg.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(pkg.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pkg.minutes} {t('Room.duration').split(' ')[1] || '分钟'}
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {t('Billing.packages.features.lifetime')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {t('Billing.packages.features.hdVideo')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {t('Billing.packages.features.encrypted')}
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(pkg)}
                      disabled={isPurchasing === pkg.id}
                    >
                      {isPurchasing === pkg.id ? t('Billing.packages.processing') : t('Billing.packages.buy')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 会员订阅 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{t('Billing.subscriptions.title')}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('monthly')}
                >
                  {t('Billing.subscriptions.monthly')}
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingCycle('yearly')}
                >
                  {t('Billing.subscriptions.yearly')} <span className="ml-1 text-xs">（{t('Billing.subscriptions.yearlySave')}）</span>
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative overflow-visible ${
                    plan.badge ? 'border-primary shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap z-10">
                      {t(`Billing.plans.${plan.id}.badge`)}
                    </span>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t(`Billing.plans.${plan.id}.name`)}</CardTitle>
                    <CardDescription className="text-sm">
                      {billingCycle === 'monthly' ? t('Billing.plans.member.billing') : t('Billing.plans.member.billing').replace('月', '年')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold">
                          {formatCurrency(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {billingCycle === 'yearly' ? t('Billing.subscriptions.perYear') : t('Billing.subscriptions.perMonth')}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {t('Billing.subscriptions.yearlySavings').replace('${amount}', `$${((plan.monthlyPrice * 12 - plan.yearlyPrice) / 100).toFixed(2)}`)}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {(t(`Billing.benefits.${plan.id}`) as string).split('，').map((benefit: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          {benefit.trim()}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan)}
                      disabled={isSubscribing === plan.id}
                    >
                      {isSubscribing === plan.id ? t('Billing.subscriptions.subscribing') : t('Billing.subscriptions.subscribe')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 订单历史 */}
          {billingData?.orders && billingData.orders.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">{t('Billing.orders.title')}</h2>
              <Card>
                <CardHeader>
                  <CardTitle>{t('Billing.orders.recentOrders')}</CardTitle>
                  <CardDescription>{t('Billing.orders.recentOrders')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingData.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <div className="font-medium capitalize">{t(`Pricing.${order.package}.name`) || order.package}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(order.amount)}
                          </div>
                          <div className={`text-xs ${
                            order.status === 'succeeded'
                              ? 'text-green-600 dark:text-green-400'
                              : order.status === 'failed'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
