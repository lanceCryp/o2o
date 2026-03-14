'use client';

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const { t } = useI18n();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setIsChecking(false);
    }
  }, [isLoaded]);

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/5">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, {user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('Dashboard.subtitle') || 'Start a private conversation or manage your account'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-12">
          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/50 shadow-md shadow-primary/10 animate-fade-in-up animation-delay-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle className="text-xl">{t('Dashboard.newMeeting.title')}</CardTitle>
              <CardDescription>{t('Dashboard.newMeeting.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/new">
                <Button className="w-full group-hover:shadow-lg transition-shadow">
                  {t('Dashboard.newMeeting.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-400">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center mb-2 group-hover:bg-accent transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl">{t('Dashboard.history.title')}</CardTitle>
              <CardDescription>{t('Dashboard.history.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/history">
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  {t('Dashboard.history.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-600">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <CardTitle className="text-xl">{t('Dashboard.balance.title')}</CardTitle>
              <CardDescription>{t('Dashboard.balance.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {t('Dashboard.balance.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 via-primary/5 to-accent/5 border-primary/20 animate-fade-in-up animation-delay-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground mt-1">Encrypted</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">2</div>
                  <div className="text-sm text-muted-foreground mt-1">Participants Max</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground mt-1">Downloads</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground mt-1">Privacy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
