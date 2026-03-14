import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { inviteTokens, rooms, participants } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // Find valid invite token
    const tokenList = await db.select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.token, token),
          eq(inviteTokens.used, false)
        )
      )
      .limit(1);

    if (!tokenList || tokenList.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired invite token', valid: false },
        { status: 404 }
      );
    }

    const inviteToken = tokenList[0];

    // Check if token is expired
    if (new Date() > inviteToken.expiresAt) {
      return NextResponse.json(
        { error: 'Invite token has expired', valid: false },
        { status: 410 }
      );
    }

    // Get room details
    const roomList = await db.select().from(rooms).where(eq(rooms.id, inviteToken.roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', valid: false },
        { status: 404 }
      );
    }

    const room = roomList[0];

    // Check if room is still active
    if (room.status === 'ended') {
      return NextResponse.json(
        { error: 'This meeting has ended', valid: false },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      roomId: room.id,
      roomName: room.name,
      roomUrl: room.dailyRoomUrl || `https://daily.co/room-${room.id}`,
    });
  } catch (error) {
    console.error('Error validating invite token:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite token', valid: false },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get Cloudflare context for D1 database
    const cf = getCloudflareContext();
    const db = createDb(cf.env.DB);

    // Find valid invite token
    const tokenList = await db.select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.token, token),
          eq(inviteTokens.used, false)
        )
      )
      .limit(1);

    if (!tokenList || tokenList.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired invite token' },
        { status: 404 }
      );
    }

    const inviteToken = tokenList[0];

    // Get room to get Daily.co room name
    const roomList = await db.select().from(rooms).where(eq(rooms.id, inviteToken.roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = roomList[0];

    // Get user info from Clerk (optional - guests can join without login)
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    // Mark token as used
    await db.update(inviteTokens).set({
      used: true,
      joinedBy: userId || 'anonymous',
    }).where(eq(inviteTokens.id, inviteToken.id));

    // Create participant record (userId 可为空，允许匿名用户)
    const { v4: uuidv4 } = await import('uuid');
    const now = new Date();

    await db.insert(participants).values({
      id: uuidv4(),
      roomId: inviteToken.roomId,
      userId: userId || `guest_${uuidv4()}`,
      role: 'guest',
      joinedAt: now,
    });

    // Update room status to active
    await db.update(rooms).set({
      status: 'active',
    }).where(eq(rooms.id, inviteToken.roomId));

    // 为访客生成 Daily.co 访问令牌
    const guestTokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          user_name: userId || 'Guest',
          room_name: room.dailyRoomName,
        },
      }),
    });

    let guestToken = '';
    if (guestTokenRes.ok) {
      const tokenData = await guestTokenRes.json() as { token: string };
      guestToken = tokenData.token;
    }

    return NextResponse.json({
      success: true,
      roomId: inviteToken.roomId,
      roomUrl: room.dailyRoomUrl,
      token: guestToken, // 返回令牌，让前端自己构造 URL
    });
  } catch (error) {
    console.error('Error using invite token:', error);
    return NextResponse.json(
      { error: 'Failed to use invite token' },
      { status: 500 }
    );
  }
}
