'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';

interface MeetingSummary {
  roomId: string;
  roomName: string;
  duration: number;
  endedAt: string;
  participantCount: number;
  hostName: string;
}

export default function MeetingEndedPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { isSignedIn } = useUser();

  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/room/${params.id}/summary`);
        if (res.ok) {
          const data = await res.json() as MeetingSummary;
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to fetch meeting summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [params.id]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-muted-foreground">{t('Room.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">{t('Room.endedTitle')}</CardTitle>
              <CardDescription>{summary?.roomName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {summary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('Room.durationLabel')}
                      </div>
                      <div className="text-2xl font-bold">
                        {formatDuration(summary.duration)}
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('Room.endTimeLabel')}
                      </div>
                      <div className="text-2xl font-bold">
                        {formatTime(summary.endedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {t('Room.participantCountLabel')}
                    </div>
                    <div className="text-xl font-semibold">
                      {summary.participantCount} {summary.participantCount === 1 ? t('Room.participant') : t('Room.participants')}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {isSignedIn ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
                    {t('Room.backToDashboard')}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => router.push('/sign-up')}
                    >
                      {t('Room.signupCta')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/sign-in')}
                    >
                      {t('Common.signIn')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
