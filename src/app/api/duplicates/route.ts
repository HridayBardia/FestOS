// Duplicate candidate resolution API
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'registration']);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { candidateId, primaryId, duplicateId, action, reason } = body;

    const trimmedReason = (reason || '').trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'A non-empty resolution reason (minimum 5 characters) is mandatory.'
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const role = session.role;
    const actor = session.memberId;

    if (action === 'confirm_canonical') {
      // Reassign duplicate participant to primary canonical_id
      await db.query(
        `UPDATE participants
         SET canonical_id = $1, is_duplicate = TRUE
         WHERE participant_id = $2;`,
        [primaryId, duplicateId]
      );

      // Mark candidate record resolved
      await db.query(
        `UPDATE duplicate_candidates
         SET status = 'resolved', resolution_note = $1, resolved_by = $2
         WHERE id = $3;`,
        [trimmedReason, actor, candidateId]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'duplicate_resolved_canonical',
        entityType: 'participants',
        entityId: duplicateId,
        reason: trimmedReason,
        beforeState: { canonical_id: duplicateId },
        afterState: { canonical_id: primaryId, resolved_by: actor }
      });

      await broadcastInvalidation('registration', 'duplicate_resolution');

      return NextResponse.json({
        success: true,
        candidateId,
        primaryId,
        duplicateId,
        status: 'resolved'
      });
    }

    if (action === 'keep_distinct') {
      await db.query(
        `UPDATE duplicate_candidates
         SET status = 'dismissed', resolution_note = $1, resolved_by = $2
         WHERE id = $3;`,
        [trimmedReason, actor, candidateId]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'duplicate_dismissed_distinct',
        entityType: 'duplicate_candidates',
        entityId: candidateId,
        reason: trimmedReason,
        beforeState: { status: 'pending' },
        afterState: { status: 'dismissed', resolved_by: actor }
      });

      await broadcastInvalidation('registration', 'duplicate_resolution');

      return NextResponse.json({
        success: true,
        candidateId,
        status: 'dismissed'
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

