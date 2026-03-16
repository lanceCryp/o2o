import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { rooms, participants, meetingRecords, users } from '@/drizzle/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // 获取房间信息
    const roomList = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = roomList[0];

    // 获取会议记录
    const recordList = await db.select().from(meetingRecords).where(eq(meetingRecords.roomId, roomId)).limit(1);
    const record = recordList[0];

    // 获取参与者数量
    const participantList = await db.select().from(participants).where(eq(participants.roomId, roomId));
    const participantCount = participantList.length;

    // 获取房主信息
    const userList = await db.select().from(users).where(eq(users.id, room.hostId)).limit(1);
    const hostName = userList[0]?.username || 'Host';

    return NextResponse.json({
      roomId: room.id,
      roomName: room.name,
      duration: record?.duration || 0,
      endedAt: room.endedAt?.toISOString() || new Date().toISOString(),
      participantCount,
      hostName,
    });
  } catch (error) {
    console.error('Error fetching meeting summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting summary' },
      { status: 500 }
    );
  }
}
