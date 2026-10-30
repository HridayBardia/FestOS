// FestOS Logout API Route
// Clears session cookie and writes audit log entry
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/db';
import { RoleKey } from '@/config/roles';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);

    if (session) {
      await logAudit({
        actorId: session.memberId,
        actorRole: session.role as RoleKey,
        action: 'LOGOUT',
        entityType: 'auth',
        entityId: session.memberId,
        reason: 'User logged out and terminated session',
      });
    }

    const response = NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

