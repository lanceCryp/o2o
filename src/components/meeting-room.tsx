"use client";

import {
  DailyProvider,
  useCallObject,
  useDaily,
  useLocalParticipant,
  useParticipantIds,
  useParticipant,
  useDailyEvent,
} from "@daily-co/daily-react";
import { DailyVideo, DailyAudio, DailyAudioTrack } from "@daily-co/daily-react";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-provider";

interface MeetingRoomProps {
  roomUrl: string;
  isHost: boolean;
  roomId?: string;
  onLeave?: () => void;
  onMeetingEnded?: () => void;
}

// 参与者视频组件（在循环外使用 Hook，避免违反 Hooks 规则）
function ParticipantVideo({ sessionId }: { sessionId: string }) {
  const participant = useParticipant(sessionId);
  const { t } = useI18n();

  if (!participant) return null;

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${
        participant.local ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* 视频轨道 */}
      <DailyVideo
        sessionId={sessionId}
        type="video"
        automirror
        className="w-full h-full object-cover"
        playableStyle={{ opacity: 1 }}
        style={{
          opacity: participant.tracks?.video?.state === "playable" ? 1 : 0.5,
        }}
      />

      {/* 音频轨道 - 使用 DailyAudioTrack 渲染每个参与者的音频 */}
      <DailyAudioTrack sessionId={sessionId} />

      {/* 参与者信息 */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">
            {participant.user_name || t("Room.participant")}
          </span>
          {participant.tracks?.audio?.state !== "playable" && (
            <span className="text-red-400 text-xs">{t("Room.muted")}</span>
          )}
        </div>
      </div>

      {/* 本地参与者标识 */}
      {participant.local && (
        <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs px-2 py-1 rounded">
          {t("Room.you")}
        </div>
      )}
    </div>
  );
}

function MeetingRoomContent({ roomUrl, isHost, roomId, onLeave, onMeetingEnded }: MeetingRoomProps) {
  const { t } = useI18n();
  const daily = useDaily();
  const localParticipant = useLocalParticipant();
  const participantIds = useParticipantIds();

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // 加入会议
  useEffect(() => {
    if (!daily || !roomUrl) return;

    const joinMeeting = async () => {
      try {
        setJoinError(null);
        console.log("[MeetingRoom] Joining room:", roomUrl);

        // URL 已经在 useCallObject 时通过 options.url 传递
        // daily.join() 不需要再传递 URL，Daily 会自动使用 callObject 中配置的 URL
        await daily.join();
        console.log("[MeetingRoom] Joined successfully");
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error("[MeetingRoom] Failed to join meeting:", error);
        setJoinError(errorMsg);
      }
    };

    joinMeeting();

    return () => {
      daily.leave();
    };
  }, [daily, roomUrl]);

  // 切换音频
  const toggleAudio = useCallback(() => {
    if (!daily) return;
    daily.setLocalAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  }, [daily, isAudioEnabled]);

  // 切换视频
  const toggleVideo = useCallback(() => {
    if (!daily) return;
    daily.setLocalVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  }, [daily, isVideoEnabled]);

  // 离开会议 - 房主和访客有不同的处理逻辑
  const handleLeave = useCallback(async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    try {
      if (isHost) {
        // 房主离开：结束会议
        console.log("[MeetingRoom] Host leaving, ending meeting...");
        if (roomId) {
          try {
            await fetch(`/api/room/${roomId}`, { method: 'DELETE' });
            console.log("[MeetingRoom] Meeting ended successfully");
          } catch (err) {
            console.error("[MeetingRoom] Failed to end meeting:", err);
          }
        }
        // 调用 onMeetingEnded 跳转到结束页面
        onMeetingEnded?.();
      } else {
        // 访客离开：直接离开
        console.log("[MeetingRoom] Guest leaving...");
        onLeave?.();
      }
    } finally {
      setIsLeaving(false);
    }
  }, [isHost, roomId, onLeave, onMeetingEnded, isLeaving]);

  const participantCount = participantIds.length;

  // 显示加入错误
  if (joinError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-red-500 text-lg font-medium mb-2">
          {t("Room.joinError")}
        </div>
        <div className="text-muted-foreground text-sm mb-4">{joinError}</div>
        <Button onClick={() => onLeave?.()}>{t("Common.back")}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 视频网格区域 */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden p-4">
        <div
          className="grid gap-4 h-full"
          style={{
            gridTemplateColumns:
              participantCount === 1
                ? "1fr"
                : participantCount === 2
                  ? "repeat(2, 1fr)"
                  : participantCount <= 4
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
          }}
        >
          {participantIds.map((sessionId) => (
            <ParticipantVideo key={sessionId} sessionId={sessionId} />
          ))}

          {/* 空状态 */}
          {participantIds.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-full text-muted-foreground">
              {t("Room.waitingForParticipants")}
            </div>
          )}
        </div>
      </div>

      {/* 控制栏 */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <Button
          variant={isAudioEnabled ? "outline" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="w-14 h-14 rounded-full"
        >
          {isAudioEnabled ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "outline" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="w-14 h-14 rounded-full"
        >
          {isVideoEnabled ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeave}
          className="w-14 h-14 rounded-full"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </Button>
      </div>

      {/* 参与者计数 */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {participantCount}{" "}
        {participantCount === 1
          ? t("Room.participant")
          : t("Room.participants")}
      </div>
    </div>
  );
}

export function MeetingRoom({ roomUrl, isHost, roomId, onLeave, onMeetingEnded }: MeetingRoomProps) {
  // 从 URL 中提取 token（格式：https://xxx.daily.co/xxx?t=xxx）
  const urlParts = roomUrl.split("?t=");
  const baseUrl = urlParts[0];
  const token = urlParts[1] || "";

  // 使用 useCallObject 创建 Call Object 实例
  // 注意：useCallObject 使用 options 参数（DailyFactoryOptions 类型）
  // url 和 token 应该分开传递
  const callObject = useCallObject({
    options: {
      url: baseUrl, // 不带 token 的基础 URL
      token: token, // token 作为单独属性传递
      subscribeToTracksAutomatically: true,
    },
  });

  return (
    <DailyProvider callObject={callObject}>
      <MeetingRoomContent roomUrl={roomUrl} isHost={isHost} roomId={roomId} onLeave={onLeave} onMeetingEnded={onMeetingEnded} />
    </DailyProvider>
  );
}
