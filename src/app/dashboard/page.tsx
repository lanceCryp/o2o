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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('Dashboard.newMeeting.title')}</CardTitle>
              <CardDescription>{t('Dashboard.newMeeting.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/new">
                <Button className="w-full">{t('Dashboard.newMeeting.button')}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Dashboard.history.title')}</CardTitle>
              <CardDescription>{t('Dashboard.history.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/history">
                <Button variant="outline" className="w-full">{t('Dashboard.history.button')}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Dashboard.balance.title')}</CardTitle>
              <CardDescription>{t('Dashboard.balance.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full">{t('Dashboard.balance.button')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
