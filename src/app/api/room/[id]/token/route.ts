import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { rooms, participants } from '@/drizzle/schema';

/**
 * 生成 Daily.co 访问令牌
 * 只有房主或参与者才能获取令牌
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // 尝试获取用户身份
    let userId: string | null = null;
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const authResult = await auth();
      userId = authResult.userId;
    } catch (e) {
      // 未登录用户
    }

    // 获取房间
    const roomList = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = roomList[0];

    // 检查房间是否已结束
    if (room.status === 'ended') {
      return NextResponse.json(
        { error: 'Meeting has ended' },
        { status: 410 }
      );
    }

    // 验证用户权限（房主或参与者）
    let isHost = false;
    let isParticipant = false;

    if (userId) {
      isHost = room.hostId === userId;
      const participantRecord = await db.select().from(participants).where(
        and(
          eq(participants.roomId, roomId),
          eq(participants.userId, userId)
        )
      ).limit(1);
      isParticipant = participantRecord.length > 0;
    }

    // 访客（通过邀请链接加入的）也可以获取令牌
    // 检查邀请令牌（used=true 也可以，因为 join 页面已经验证过）
    const url = new URL(request.url);
    const inviteToken = url.searchParams.get('invite_token');

    if (inviteToken) {
      const { inviteTokens } = await import('@/drizzle/schema');
      const tokenRecord = await db.select().from(inviteTokens).where(
        and(
          eq(inviteTokens.token, inviteToken),
          eq(inviteTokens.roomId, roomId)
        )
      ).limit(1);

      if (tokenRecord.length > 0) {
        // 有效的邀请令牌（无论 used 状态，因为 join 页面已经验证过）
        isParticipant = true;
      }
    }

    // 如果房间状态是 active，说明已经有人在里面，允许访客以 guest 身份加入
    // 这适用于访客直接访问房间 URL 的情况（例如从 join 页面跳转过来）
    if (room.status === 'active' && !userId) {
      isParticipant = true;
    }

    if (!isHost && !isParticipant) {
      return NextResponse.json(
        { error: 'Access denied. You need to be the host or have a valid invite token.' },
        { status: 403 }
      );
    }

    // 生成 Daily.co 访问令牌
    const tokenRes = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          user_name: userId || 'guest',
          is_owner: isHost,
          room_name: room.dailyRoomName,
        },
      }),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.json();
      console.error('Daily.co token API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      );
    }

    const tokenData = await tokenRes.json() as { token: string };

    // 构造带有访问令牌的 URL (?t=xxx 格式)
    const dailyUrl = `${room.dailyRoomUrl}?t=${tokenData.token}`;

    return NextResponse.json({
      token: tokenData.token,
      dailyUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
