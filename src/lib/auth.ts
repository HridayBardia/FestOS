// FestOS Authentication Library
// Password verification, session extraction, and role enforcement
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db, logAudit } from './db';
import { RoleKey } from '@/config/roles';
import {
  SessionPayload,
  SESSION_COOKIE_NAME,
  signSession,
  verifySession,
} from './jwt';

export type { SessionPayload };
export { SESSION_COOKIE_NAME, signSession, verifySession };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch (e) {
      // Cookies not accessible in current context
    }
  }

  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(
  req: NextRequest
): Promise<{ session: SessionPayload } | NextResponse> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Confirm account is active in database
  const userCheck = await db.query(
    'SELECT is_active FROM app_users WHERE login_id = $1;',
    [session.memberId]
  );
  if (userCheck.rows.length === 0 || !userCheck.rows[0].is_active) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Account inactive' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return { session };
}

export async function requireRole(
  req: NextRequest,
  allowedRoles: RoleKey[]
): Promise<{ session: SessionPayload } | NextResponse> {
  const sessionResult = await requireSession(req);
  if ('status' in sessionResult) {
    return sessionResult;
  }

  const { session } = sessionResult;

  if (!allowedRoles.includes(session.role)) {
    // Write audit log for unauthorized role access attempt
    await logAudit({
      actorId: session.memberId,
      actorRole: session.role,
      action: 'UNAUTHORIZED_ROLE_ACCESS',
      entityType: 'api_route',
      entityId: req.nextUrl.pathname,
      reason: `Access denied: role "${session.role}" attempted forbidden endpoint requiring [${allowedRoles.join(', ')}]`,
    });

    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return { session };
}
