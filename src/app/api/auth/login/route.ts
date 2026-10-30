// FestOS Login API Route
// Node runtime with rate limiting, dummy timing mitigation, audit logging, and signed JWT cookie
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, logAudit } from '@/lib/db';
import { signSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { RoleKey } from '@/config/roles';

// Dummy bcrypt hash for constant-time comparison on unknown user IDs
const DUMMY_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawLoginId = typeof body.loginId === 'string' ? body.loginId : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const normalizedId = rawLoginId.trim().toUpperCase();

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // Immediate validation for blank inputs
    if (!normalizedId || !password) {
      if (normalizedId) {
        const attemptId = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await db.query(
          'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, false);',
          [attemptId, normalizedId, ip]
        );
        await logAudit({
          actorId: normalizedId,
          actorRole: 'unauthenticated' as RoleKey,
          action: 'LOGIN_FAILURE',
          entityType: 'auth',
          entityId: normalizedId,
          reason: 'Login failed: missing credentials',
        });
      }
      return NextResponse.json(
        { success: false, error: 'Invalid ID or password' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Rate limiting: 5 failures in 5 minutes for that ID
    const lockoutRes = await db.query(
      `SELECT COUNT(*) as fail_count
       FROM login_attempts
       WHERE login_id = $1
         AND success = false
         AND attempted_at > (CURRENT_TIMESTAMP - INTERVAL '5 minutes');`,
      [normalizedId]
    );

    const failCount = parseInt(lockoutRes.rows[0]?.fail_count || '0', 10);
    if (failCount >= 5) {
      const attemptId = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.query(
        'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, false);',
        [attemptId, normalizedId, ip]
      );
      await logAudit({
        actorId: normalizedId,
        actorRole: 'unauthenticated' as RoleKey,
        action: 'LOGIN_LOCKOUT',
        entityType: 'auth',
        entityId: normalizedId,
        reason: 'Rate limit exceeded: 5 failures in 5 minutes',
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID or password. Too many failed attempts, please try again later.',
        },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Lookup user in app_users joined with core_team
    const userRes = await db.query(
      `SELECT u.id, u.login_id, u.core_team_id, u.role_key, u.password_hash, u.is_active, c.name, c.shift
       FROM app_users u
       JOIN core_team c ON u.core_team_id = c.member_id
       WHERE u.login_id = $1;`,
      [normalizedId]
    );

    const attemptId = `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (userRes.rows.length === 0) {
      // Dummy comparison to prevent timing side channels
      await bcrypt.compare(password, DUMMY_HASH);
      await db.query(
        'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, false);',
        [attemptId, normalizedId, ip]
      );
      await logAudit({
        actorId: normalizedId,
        actorRole: 'unauthenticated' as RoleKey,
        action: 'LOGIN_FAILURE',
        entityType: 'auth',
        entityId: normalizedId,
        reason: 'Login failed: unknown member ID',
      });
      return NextResponse.json(
        { success: false, error: 'Invalid ID or password' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      // Compare against dummy/stored hash so timing does not reveal disabled state
      await bcrypt.compare(password, user.password_hash || DUMMY_HASH);
      await db.query(
        'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, false);',
        [attemptId, normalizedId, ip]
      );
      await logAudit({
        actorId: normalizedId,
        actorRole: 'unauthenticated' as RoleKey,
        action: 'LOGIN_FAILURE',
        entityType: 'auth',
        entityId: normalizedId,
        reason: 'Login failed: account is disabled',
      });
      return NextResponse.json(
        { success: false, error: 'Invalid ID or password' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await db.query(
        'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, false);',
        [attemptId, normalizedId, ip]
      );
      await logAudit({
        actorId: normalizedId,
        actorRole: 'unauthenticated' as RoleKey,
        action: 'LOGIN_FAILURE',
        entityType: 'auth',
        entityId: normalizedId,
        reason: 'Login failed: password mismatch',
      });
      return NextResponse.json(
        { success: false, error: 'Invalid ID or password' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Successful authentication
    await db.query(
      'INSERT INTO login_attempts (id, login_id, ip, success) VALUES ($1, $2, $3, true);',
      [attemptId, normalizedId, ip]
    );
    await logAudit({
      actorId: normalizedId,
      actorRole: user.role_key as RoleKey,
      action: 'LOGIN_SUCCESS',
      entityType: 'auth',
      entityId: normalizedId,
      reason: 'Member successfully authenticated',
    });

    const token = await signSession({
      memberId: user.login_id,
      name: user.name,
      role: user.role_key as RoleKey,
      shift: user.shift,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        role: user.role_key,
        homePath: `/${user.role_key}`,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 10 * 60 * 60, // 10 hours
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

