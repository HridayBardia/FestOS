// FestOS Audit Logs API
// Reads verified immutable audit log records from database
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
      `SELECT id, timestamp, actor_id, actor_role, action, entity_type, entity_id, reason, previous_state, new_state, approved_by
       FROM audit_log
       ORDER BY timestamp DESC
       LIMIT 100;`
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

