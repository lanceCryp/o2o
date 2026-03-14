'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';

interface InviteData {
  valid: boolean;
  roomId?: string;
  roomName?: string;
  roomUrl?: string;
  error?: string;
}

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { isLoaded } = useUser();

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    // 不需要登录即可加入，直接验证邀请
    validateInvite();
  }, [isLoaded, params.token]);

  const validateInvite = async () => {
    try {
      const res = await fetch(`/api/join/${params.token}`);
      const data = await res.json() as InviteData;

      if (!res.ok) {
        setError(data.error || 'Invalid invite');
      }

      setInviteData(data);
    } catch (err) {
      setError('Failed to validate invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/join/${params.token}`, { method: 'POST' });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to join');
      }

      const data = await res.json() as { roomId: string; token: string };
      // 跳转到我们自己的房间页面，带上令牌
      window.location.href = `/room/${data.roomId}?t=${data.token}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-muted-foreground">{t('Common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !inviteData?.valid) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">{t('Room.notFound')}</CardTitle>
              <CardDescription>
                {error || inviteData?.error || t('Room.notFoundDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full">{t('Common.back')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('Dashboard.newMeeting.title')}</CardTitle>
              <CardDescription>
                {inviteData.roomName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('Room.shareLink')}
                </p>
                <p className="font-medium">{inviteData.roomName}</p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full"
              >
                {isJoining ? t('Common.loading') : 'Join Meeting'}
              </Button>

              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  {t('Common.back')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
