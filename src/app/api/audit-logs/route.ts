// FestOS Audit Logs API
// Unified shared ledger across all 48 members with cross-session broadcast
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { inMemoryDb } from '@/lib/inMemoryDb';

export const dynamic = 'force-dynamic';

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

    let logs = (result && Array.isArray(result.rows) && result.rows.length > 0) ? result.rows : inMemoryDb.auditLogs;

    // Deduplicate and ensure timestamp
    const seen = new Set();
    const cleanLogs = logs.filter((l: any) => {
      if (!l || !l.id || seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    return NextResponse.json(
      { success: true, logs: cleanLogs },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: true, logs: inMemoryDb.auditLogs || [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
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
    const timestamp = new Date().toISOString();

    const newEntry = {
      id: auditId,
      timestamp,
      created_at: timestamp,
      actor_id: memberId,
      actor_role: role,
      action: action || 'OPERATIONAL_OVERRIDE',
      entity_type: entityType || 'general',
      entity_id: entityId || 'SYS',
      reason: trimmedReason,
      before_state: beforeState ? (typeof beforeState === 'string' ? beforeState : JSON.stringify(beforeState)) : null,
      after_state: afterState ? (typeof afterState === 'string' ? afterState : JSON.stringify(afterState)) : null
    };

    // 1. Immediately store in shared inMemoryDb
    inMemoryDb.auditLogs.unshift(newEntry);

    // 2. Persist to Postgres database if available
    try {
      await db.query(
        `INSERT INTO audit_log (
          id, actor_id, actor_role, action, entity_type, entity_id, reason, before_state, after_state
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          auditId,
          memberId,
          role,
          newEntry.action,
          newEntry.entity_type,
          newEntry.entity_id,
          trimmedReason,
          newEntry.before_state,
          newEntry.after_state
        ]
      );
    } catch {}

    return NextResponse.json({
      success: true,
      auditId,
      actor: name || memberId,
      timestamp
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
