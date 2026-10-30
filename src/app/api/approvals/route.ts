// Approvals API: creation and executive decisions with mandatory audit log
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireSession, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'hospitality']);
    if ('status' in authRes) return authRes;

    const res = await db.query(`SELECT * FROM approvals ORDER BY created_at DESC LIMIT 50;`);
    return NextResponse.json(
      { success: true, approvals: res.rows },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { actionType, approvalId, decision, reason, payload, entityTable, entityId } = body;

    const role = session.role;
    const actor = session.memberId;
    const trimmedReason = (reason || '').trim();

    if (!trimmedReason || trimmedReason.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'A non-empty justification reason (minimum 5 characters) is mandatory.'
      }, { status: 400 });
    }

    // Branch 1: Executive decision by Director
    if (actionType === 'decide') {
      if (role !== 'director') {
        return NextResponse.json({
          success: false,
          error: 'Permission denied: Only Festival Director has authority to decide approval requests.'
        }, { status: 403 });
      }

      if (!approvalId || !decision) {
        return NextResponse.json({ success: false, error: 'approvalId and decision (approved/rejected) are required' }, { status: 400 });
      }

      const existingRes = await db.query(`SELECT * FROM approvals WHERE id = $1;`, [approvalId]);
      if (existingRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Approval request not found' }, { status: 404 });
      }

      const existing = existingRes.rows[0];
      const newStatus = decision === 'approve' ? 'approved' : 'rejected';

      await db.query(
        `UPDATE approvals
         SET status = $1, decided_by = $2, decided_reason = $3, decided_at = CURRENT_TIMESTAMP
         WHERE id = $4;`,
        [newStatus, actor, trimmedReason, approvalId]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: `approval_${newStatus}`,
        entityType: existing.entity_table,
        entityId: existing.entity_id,
        reason: trimmedReason,
        beforeState: { status: existing.status },
        afterState: { status: newStatus, decided_by: actor, decided_reason: trimmedReason }
      });

      await broadcastInvalidation('director', 'approvals_updated');

      return NextResponse.json({ success: true, approvalId, status: newStatus });
    }

    // Branch 2: Create approval request
    const newId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.query(
      `INSERT INTO approvals (id, requested_by, entity_table, entity_id, action, payload, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending');`,
      [
        newId,
        actor,
        entityTable || 'system',
        entityId || 'general',
        body.action || 'request_action',
        payload ? JSON.stringify(payload) : '{}',
        trimmedReason
      ]
    );

    await logAudit({
      actorId: actor,
      actorRole: role,
      action: 'approval_requested',
      entityType: entityTable || 'system',
      entityId: entityId || 'general',
      reason: trimmedReason,
      beforeState: null,
      afterState: { approval_id: newId, status: 'pending' }
    });

    await broadcastInvalidation('director', 'approvals_updated');

    return NextResponse.json({ success: true, approvalId: newId, status: 'pending' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

