import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/lib/db';
import { inviteTokens, rooms } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Generate a secure random token
function generateToken(): string {
  return uuidv4().replace(/-/g, '');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

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

    // Verify room exists and user is the host
    const roomList = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    if (!roomList || roomList.length === 0) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const room = roomList[0];

    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: 'Only the host can generate invite tokens' },
        { status: 403 }
      );
    }

    // Check if room already has an unused token
    const existingTokens = await db.select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.roomId, roomId),
          eq(inviteTokens.used, false)
        )
      );

    if (existingTokens.length > 0) {
      // Return existing token
      return NextResponse.json({
        token: existingTokens[0].token,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/join/${existingTokens[0].token}`,
      });
    }

    // Create new invite token
    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(inviteTokens).values({
      id: uuidv4(),
      roomId,
      token,
      used: false,
      createdAt: now,
      expiresAt,
    });

    return NextResponse.json({
      token,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/join/${token}`,
    });
  } catch (error) {
    console.error('Error creating invite token:', error);
    return NextResponse.json(
      { error: 'Failed to create invite token' },
      { status: 500 }
    );
  }
}
