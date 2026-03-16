'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/header';
import { MeetingRoom } from '@/components/meeting-room';

interface RoomData {
  roomId: string;
  roomName: string;
  roomUrl: string;
  createdAt: string;
  isHost: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [showInviteUrl, setShowInviteUrl] = useState(false);
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // 不强制登录，允许访客加入
    fetchRoom();
  }, [isLoaded, params.id]);

  // 请求 Daily.co 访问令牌的完整 URL（后端代理，不暴露 token）
  const fetchDailyUrl = async () => {
    try {
      // 检查 URL 是否有 invite_token 参数（从 join 页面跳转过来的）
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite_token');

      const url = `/api/room/${params.id}/token${inviteToken ? `?invite_token=${inviteToken}` : ''}`;

      const res = await fetch(url, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json() as { error?: string };
        throw new Error(error.error || 'Failed to get Daily.co access token');
      }
      const data = await res.json() as { dailyUrl: string };
      return data.dailyUrl;
    } catch (err) {
      console.error('Failed to fetch Daily URL:', err);
      return null;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (room) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [room]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/room/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('notFound');
        } else if (res.status === 410) {
          setError('ended');
        } else {
          setError('error');
        }
        return;
      }
      const data = await res.json() as RoomData;
      setRoom(data);

      // 通过后端的 token 接口获取完整的 Daily.co URL（token 不暴露在 URL 中）
      const dailyUrlWithToken = await fetchDailyUrl();
      if (dailyUrlWithToken) {
        setRoom(prev => prev ? { ...prev, roomUrl: dailyUrlWithToken } : null);
        setIsTokenReady(true);
      }
    } catch (err) {
      setError('error');
      console.error('Failed to fetch room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const res = await fetch(`/api/room/${params.id}/invite`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate invite link');
      const data = await res.json() as { inviteUrl: string };
      navigator.clipboard.writeText(data.inviteUrl);
      setInviteUrl(data.inviteUrl);
      setShowInviteUrl(true);
      setTimeout(() => setShowInviteUrl(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      await fetch(`/api/room/${params.id}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to end call:', err);
    } finally {
      setIsEnding(false);
      setShowEndDialog(false);
    }
  };

  const handleEndCallClick = () => {
    setShowEndDialog(true);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t(`Room.${error}`)}</CardTitle>
              <CardDescription>{t(`Room.${error}Description`)}</CardDescription>
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

  if (!room || !isTokenReady) {
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

      <main className="container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-100px)]">
          {/* Main video area - Using custom MeetingRoom component */}
          <div className="lg:col-span-3 bg-black rounded-lg overflow-hidden relative">
            <MeetingRoom
              roomUrl={room.roomUrl}
              isHost={room.isHost}
              roomId={room.roomId}
              onLeave={() => router.push(room.isHost ? '/dashboard' : '/welcome')}
              onMeetingEnded={() => router.push(`/room/${params.id}/ended`)}
            />

            {/* Duration display */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm z-10">
              {t('Room.duration')}: {formatDuration(duration)}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* 房主专属：分享链接 */}
            {room.isHost && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{room.roomName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {duration > 30 ? t('Room.inCall') : t('Room.waiting')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleCopyLink}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {t('Room.copyLink')}
                  </Button>
                  {showInviteUrl && inviteUrl && (
                    <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded">
                      {t('Room.linkCopied')}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{t('Room.shareLink')}</p>
                </CardContent>
              </Card>
            )}

            {/* 访客：只显示会议名称 */}
            {!room.isHost && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{room.roomName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {duration > 30 ? t('Room.inCall') : t('Room.waiting')}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('Features.onetoone.description')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>{t('Features.private.description')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* End call confirmation dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Room.confirmEnd')}</DialogTitle>
            <DialogDescription>{t('Room.confirmEndDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              {t('Common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleEndCall} disabled={isEnding}>
              {isEnding ? t('Room.endingCall') : t('Room.endCall')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
