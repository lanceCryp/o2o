import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { rooms, meetingRecords, participants } from '@/drizzle/schema';

/**
 * 获取用户的会议历史记录
 */
export async function GET(request: NextRequest) {
  try {
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

    // 获取分页参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 查询用户作为房主的已结束会议（按房主查询）
    const hostRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        status: rooms.status,
        startedAt: rooms.startedAt,
        endedAt: rooms.endedAt,
        createdAt: rooms.createdAt,
        duration: meetingRecords.duration,
      })
      .from(rooms)
      .leftJoin(meetingRecords, eq(rooms.id, meetingRecords.roomId))
      .where(eq(rooms.hostId, userId))
      .orderBy(desc(rooms.createdAt))
      .limit(limit)
      .offset(offset);

    // 查询用户作为参与者的会议（按参与者查询）
    const participantRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        status: rooms.status,
        startedAt: rooms.startedAt,
        endedAt: rooms.endedAt,
        createdAt: rooms.createdAt,
        duration: meetingRecords.duration,
      })
      .from(participants)
      .leftJoin(rooms, eq(participants.roomId, rooms.id))
      .leftJoin(meetingRecords, eq(rooms.id, meetingRecords.roomId))
      .where(
        and(
          eq(participants.userId, userId),
          eq(participants.role, 'guest')
        )
      )
      .orderBy(desc(rooms.createdAt))
      .limit(limit)
      .offset(offset);

    // 合并结果
    const allRooms = [...hostRooms, ...participantRooms];

    // 去重（可能有重复）
    const uniqueRooms = Array.from(
      new Map(allRooms.map(room => [room.id, room])).values()
    ).sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    }).slice(0, limit);

    // 获取总数
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(eq(rooms.hostId, userId));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      meetings: uniqueRooms.map(room => ({
        id: room.id,
        name: room.name,
        status: room.status,
        createdAt: room.createdAt?.toISOString(),
        endedAt: room.endedAt?.toISOString(),
        duration: room.duration || 0, // 秒
        isHost: room.id ? true : false,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
