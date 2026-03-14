import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { rooms, participants } from '@/drizzle/schema';

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

    // 更新数据库状态
    await db.update(rooms).set({
      status: 'ended',
      endedAt: new Date(),
    }).where(eq(rooms.id, roomId));

    return NextResponse.json({ success: true, ended: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
