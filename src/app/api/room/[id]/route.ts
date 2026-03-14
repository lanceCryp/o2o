import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { rooms, participants, meetingRecords, userCredits } from '@/drizzle/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // Fetch room from database
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

    // 尝试获取用户身份（可能未登录）
    let userId: string | null = null;
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const authResult = await auth();
      userId = authResult.userId;
    } catch (e) {
      // 未登录用户，userId 保持 null
    }

    // 如果是房主，允许访问
    if (room.hostId === userId) {
      return NextResponse.json({
        roomId: room.id,
        roomName: room.name,
        roomUrl: room.dailyRoomUrl || `https://daily.co/room-${room.id}`,
        createdAt: room.createdAt.toISOString(),
        isHost: true,
      });
    }

    // 如果已登录，检查是否是参与者
    if (userId) {
      const participantList = await db.select().from(participants).where(eq(participants.roomId, roomId));
      const isParticipant = participantList.some(p => p.userId === userId);
      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // 未登录用户（访客）允许访问
    return NextResponse.json({
      roomId: room.id,
      roomName: room.name,
      roomUrl: room.dailyRoomUrl || `https://daily.co/room-${room.id}`,
      createdAt: room.createdAt.toISOString(),
      isHost: false,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

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

    // Fetch room to verify ownership
    const roomList = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = roomList[0];

    // Only host can end the call
    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 如果是强制删除（用户选择删除并新建），直接删除 Daily.co 房间和数据库记录
    if (force) {
      // 删除 Daily.co 房间
      try {
        if (room.dailyRoomName) {
          await fetch(`https://api.daily.co/v1/rooms/${room.dailyRoomName}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
            },
          });
          console.log('Daily.co room force deleted:', room.dailyRoomName);
        }
      } catch (dailyError) {
        console.error('Failed to delete Daily.co room:', dailyError);
      }

      // 删除数据库中的参与者记录
      await db.delete(participants).where(eq(participants.roomId, roomId));

      // 删除房间
      await db.delete(rooms).where(eq(rooms.id, roomId));

      return NextResponse.json({ success: true, deleted: true });
    }

    // 正常结束会议：删除 Daily.co 房间并更新数据库状态
    const now = new Date();

    // 删除 Daily.co 房间
    try {
      if (room.dailyRoomName) {
        await fetch(`https://api.daily.co/v1/rooms/${room.dailyRoomName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          },
        });
        console.log('Daily.co room deleted:', room.dailyRoomName);
      }
    } catch (dailyError) {
      console.error('Failed to delete Daily.co room:', dailyError);
    }

    // 计算会议时长（秒）
    const durationSeconds = room.startedAt
      ? Math.floor((now.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    // 更新数据库状态
    await db.update(rooms).set({
      status: 'ended',
      endedAt: now,
    }).where(eq(rooms.id, roomId));

    // 创建会议记录
    const { v4: uuidv4 } = await import('uuid');
    await db.insert(meetingRecords).values({
      id: uuidv4(),
      roomId,
      hostId: room.hostId,
      duration: durationSeconds,
      type: 'video',
      status: 'ended',
      endedBy: 'host',
      createdAt: now,
    });

    // 更新房主的已用时长（从 user_credits 扣除）
    const durationMinutes = Math.ceil(durationSeconds / 60); // 向上取整分钟数
    const hostCreditsList = await db.select().from(userCredits).where(eq(userCredits.userId, room.hostId)).limit(1);

    if (hostCreditsList.length > 0) {
      await db.update(userCredits).set({
        usedMinutes: hostCreditsList[0].usedMinutes + durationMinutes,
      }).where(eq(userCredits.id, hostCreditsList[0].id));
      console.log(`Updated host credits: used ${durationMinutes} minutes, total used: ${hostCreditsList[0].usedMinutes + durationMinutes}`);
    } else {
      // 如果没有时长记录，说明是新用户首次通话，不自动创建记录
      // 时长扣减会在用户购买套餐或订阅时处理
      console.log(`Host ${room.hostId} has no credits record, skipping deduction`);
    }

    // 同时更新参与者的时长（如果参与者在数据库中有时长记录）
    const participantList = await db.select().from(participants).where(eq(participants.roomId, roomId));
    for (const participant of participantList) {
      if (participant.userId && !participant.userId.startsWith('guest_')) {
        const participantCredits = await db.select().from(userCredits).where(eq(userCredits.userId, participant.userId)).limit(1);
        if (participantCredits.length > 0) {
          await db.update(userCredits).set({
            usedMinutes: participantCredits[0].usedMinutes + durationMinutes,
          }).where(eq(userCredits.id, participantCredits[0].id));
          console.log(`Updated participant ${participant.userId} credits: used ${durationMinutes} minutes`);
        }
      }
    }

    return NextResponse.json({ success: true, ended: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
