// FestOS Audit Logs API
// Unified shared ledger across all 48 members with cross-session broadcast
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const sessionResult = await requireSession(req);
  if ('status' in sessionResult) {
    return sessionResult;
  }

  try {
    const result = await db.query(
      `SELECT id, timestamp, actor_id, actor_role, action, entity_type, entity_id, reason, before_state, after_state
       FROM audit_log
       ORDER BY timestamp DESC
       LIMIT 200;`
    );

    return NextResponse.json(
      { success: true, logs: result.rows },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(req: NextRequest) {
  const sessionResult = await requireSession(req);
  if ('status' in sessionResult) {
    return sessionResult;
  }

  const { memberId, role, name } = sessionResult.session;

  try {
    const body = await req.json().catch(() => ({}));
    const { action, entityType, entityId, reason, beforeState, afterState } = body;

    const trimmedReason = (reason || '').trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      return NextResponse.json(
        { success: false, error: 'A mandatory justification reason (min 5 characters) is required.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const auditId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await db.query(
      `INSERT INTO audit_log (
        id, actor_id, actor_role, action, entity_type, entity_id, reason, before_state, after_state
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        auditId,
        memberId,
        role,
        action || 'OPERATIONAL_OVERRIDE',
        entityType || 'general',
        entityId || 'SYS',
        trimmedReason,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null
      ]
    );

    return NextResponse.json({
      success: true,
      auditId,
      actor: name || memberId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
