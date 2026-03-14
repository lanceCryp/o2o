'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/i18n-provider';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Header from '@/components/header';
import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();

  if (!isLoaded || !isSignedIn) {
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

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('Settings.title')}</h1>
            <p className="text-muted-foreground">{t('Settings.description')}</p>
          </div>

          {/* 个人资料 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Settings.profile.title')}</CardTitle>
              <CardDescription>{t('Settings.profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    <span>{user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('Settings.profile.memberSince')}: {formatDate(user?.createdAt || null)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('Settings.profile.name')}</label>
                  <p className="text-muted-foreground">{user?.fullName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('Settings.profile.email')}</label>
                  <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('https://dashboard.clerk.com')}>
                管理账户
              </Button>
            </CardContent>
          </Card>

          {/* 偏好设置 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Settings.preferences.title')}</CardTitle>
              <CardDescription>{t('Settings.preferences.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('Settings.preferences.language')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'zh' ? t('Settings.preferences.languageZh') : locale === 'en' ? t('Settings.preferences.languageEn') : t('Settings.preferences.languageAuto')}
                  </p>
                </div>
                <LanguageToggle />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('Settings.preferences.theme')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'light' ? t('Settings.preferences.themeLight') : theme === 'dark' ? t('Settings.preferences.themeDark') : t('Settings.preferences.themeSystem')}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* 账户管理 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Settings.account.title')}</CardTitle>
              <CardDescription>{t('Settings.account.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('Settings.account.password')}</h3>
                  <p className="text-sm text-muted-foreground">修改您的登录密码</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.clerk.com', '_blank')}>
                  管理
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('Settings.account.twoFactor')}</h3>
                  <p className="text-sm text-muted-foreground">启用双重验证保护您的账户</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.clerk.com', '_blank')}>
                  管理
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('Settings.account.sessions')}</h3>
                  <p className="text-sm text-muted-foreground">查看和管理已登录的设备</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.clerk.com', '_blank')}>
                  查看
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 返回仪表板 */}
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline">{t('Common.back')}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
