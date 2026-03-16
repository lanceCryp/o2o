'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t('Welcome.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('Welcome.subtitle')}
            </p>
          </div>

          {/* 功能亮点 */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">{t('Welcome.features.private.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('Welcome.features.private.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">{t('Welcome.features.onetoone.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('Welcome.features.onetoone.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <CardTitle className="text-lg">{t('Welcome.features.nodownload.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('Welcome.features.nodownload.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">{t('Welcome.offer.title')}</CardTitle>
              <CardDescription>
                {t('Welcome.offer.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => router.push('/sign-up')}
                >
                  {t('Welcome.offer.signupButton')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => router.push('/sign-in')}
                >
                  {t('Welcome.offer.signinButton')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Welcome.offer.note')}
              </p>
            </CardContent>
          </Card>

          {/* 定价预览 */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4">{t('Welcome.pricing.title')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">{t('Welcome.pricing.starter.price')}</div>
                <div className="text-sm text-muted-foreground mb-2">{t('Welcome.pricing.starter.minutes')}</div>
                <div className="text-xs text-muted-foreground">{t('Welcome.pricing.starter.limit')}</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
                <div className="text-xs text-primary font-semibold mb-1">{t('Welcome.pricing.standard.badge')}</div>
                <div className="text-2xl font-bold mb-1">{t('Welcome.pricing.standard.price')}</div>
                <div className="text-sm text-muted-foreground mb-2">{t('Welcome.pricing.standard.minutes')}</div>
                <div className="text-xs text-muted-foreground">{t('Welcome.pricing.standard.limit')}</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">{t('Welcome.pricing.unlimited.price')}</div>
                <div className="text-sm text-muted-foreground mb-2">{t('Welcome.pricing.unlimited.minutes')}</div>
                <div className="text-xs text-muted-foreground">{t('Welcome.pricing.unlimited.limit')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
