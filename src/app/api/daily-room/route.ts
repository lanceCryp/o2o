import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { rooms, participants, users } from '@/drizzle/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string };
    const { name } = body;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();

    const db = createDb(cf.env.DB);

    // Get user info from Clerk
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 确保用户存在于数据库中 (Clerk 用户同步)
    // 使用 userId 直接插入，其他字段可以为空或稍后更新
    await db.insert(users).values({
      id: userId,
      email: '', // 稍后更新或使用其他方式获取
      username: '',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();

    // 检查用户是否已有活跃的房间
    const existingActiveRoom = await db.query.rooms.findFirst({
      where: (r, { and, eq, inArray }) =>
        and(eq(r.hostId, userId), inArray(r.status, ['waiting', 'active'])),
    });

    if (existingActiveRoom) {
      return NextResponse.json(
        {
          error: '您已经有一个活跃的会议室',
          existingRoomId: existingActiveRoom.id,
          existingRoomName: existingActiveRoom.name,
        },
        { status: 409 }
      );
    }

    // Generate unique room ID
    const roomId = uuidv4();

    // Call Daily.co API to create room
    const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `room-${roomId}`,
        privacy: 'private', // 使用 private，通过访问令牌控制访问
      }),
    });

    if (!dailyRes.ok) {
      const error = await dailyRes.json();
      console.error('Daily.co API error:', error);
      throw new Error('Failed to create video room');
    }

    const roomData = await dailyRes.json() as { name: string; url: string };
    const now = new Date();

    // 为房主生成 Daily.co 访问令牌
    const ownerTokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          is_owner: true,
          user_name: 'Host',
          room_name: roomData.name,
        },
      }),
    });

    let ownerToken = '';
    if (ownerTokenRes.ok) {
      const tokenData = await ownerTokenRes.json() as { token: string };
      ownerToken = tokenData.token;
    } else {
      console.error('Failed to generate owner token');
    }

    // Store room in database
    await db.insert(rooms).values({
      id: roomId,
      name: name || 'Quick Meeting',
      hostId: userId,
      status: 'waiting',
      dailyRoomName: roomData.name,
      dailyRoomUrl: roomData.url,
      startedAt: now,
      createdAt: now,
    });

    // Create participant record for host
    await db.insert(participants).values({
      id: uuidv4(),
      roomId,
      userId,
      role: 'host',
      joinedAt: now,
    });

    // 返回房主令牌，使用 hostToken 字段明确表示
    return NextResponse.json({
      roomId,
      roomName: name || 'Quick Meeting',
      hostToken: ownerToken, // 房主令牌（如果需要在前端存储）
      dailyRoomUrl: roomData.url,
      createdAt: now.toISOString(),
      isHost: true,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
