'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ExistingRoomError {
  error: string;
  existingRoomId: string;
  existingRoomName: string;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [meetingName, setMeetingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [existingRoom, setExistingRoom] = useState<ExistingRoomError | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: meetingName || 'Quick Meeting' }),
      });

      if (res.status === 409) {
        // 已有活跃房间
        const data = await res.json() as ExistingRoomError;
        setExistingRoom(data);
        setIsCreating(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to create room');
      }

      const data = await res.json() as { roomId: string; token: string };
      // 跳转到房间页面，带上令牌
      window.location.href = `/room/${data.roomId}?t=${data.token}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEnterExisting = () => {
    if (existingRoom) {
      router.push(`/room/${existingRoom.existingRoomId}`);
    }
  };

  const handleCreateNew = async () => {
    if (!existingRoom) return;

    setIsCreating(true);
    setError('');

    try {
      // 先强制删除旧房间（包括 Daily.co 房间）
      const deleteRes = await fetch(`/api/room/${existingRoom.existingRoomId}?force=true`, {
        method: 'DELETE',
      });

      if (!deleteRes.ok && deleteRes.status !== 404) {
        throw new Error('Failed to delete existing room');
      }

      // 删除后创建新房间
      const createRes = await fetch('/api/daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: meetingName || 'Quick Meeting' }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create new room');
      }

      const data = await createRes.json() as { roomId: string };
      setExistingRoom(null);
      router.push(`/room/${data.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setExistingRoom(null);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('Dashboard.newMeeting.pageTitle')}</CardTitle>
              <CardDescription>
                {t('Dashboard.newMeeting.pageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-name">{t('Dashboard.newMeeting.meetingNameLabel')}</Label>
                  <Input
                    id="meeting-name"
                    placeholder={t('Dashboard.newMeeting.meetingNamePlaceholder')}
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? t('Dashboard.newMeeting.creating') : t('Dashboard.newMeeting.createButton')}
                </Button>
              </form>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{t('Dashboard.newMeeting.features.private')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{t('Dashboard.newMeeting.features.encrypted')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{t('Dashboard.newMeeting.features.nodownload')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 已有房间对话框 */}
      <Dialog open={!!existingRoom} onOpenChange={() => setExistingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>已有活跃会议室</DialogTitle>
            <DialogDescription>
              您已经创建了一个名为"{existingRoom?.existingRoomName}"的会议室。
              您想要进入已有会议室，还是删除它并创建一个新的？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleEnterExisting}
              disabled={isCreating}
            >
              进入已有房间
            </Button>
            <Button
              variant="destructive"
              onClick={handleCreateNew}
              disabled={isCreating}
            >
              {isCreating ? '删除中...' : '删除并新建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
