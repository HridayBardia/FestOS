// Duplicate candidate resolution and audit API
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'registration']);
    if ('status' in authRes) return authRes;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const search = (searchParams.get('search') || '').trim();
    const college = searchParams.get('college') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));

    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let pIdx = 1;

    if (status !== 'all') {
      conditions.push(`dc.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (search) {
      conditions.push(`(
        p1.name ILIKE $${pIdx} OR p2.name ILIKE $${pIdx} OR
        dc.primary_id ILIKE $${pIdx} OR dc.duplicate_id ILIKE $${pIdx} OR
        p1.college ILIKE $${pIdx} OR dc.id ILIKE $${pIdx}
      )`);
      params.push(`%${search}%`);
      pIdx++;
    }

    if (college !== 'all') {
      conditions.push(`(p1.college = $${pIdx} OR p2.college = $${pIdx})`);
      params.push(college);
      pIdx++;
    }

    const whereClause = conditions.join(' AND ');

    // Aggregate summary counts across the entire 420 dataset
    const summaryRes = await db.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END)::int AS dismissed
      FROM duplicate_candidates;
    `);

    // Count matching rows
    const countRes = await db.query(`
      SELECT COUNT(*)::int AS count
      FROM duplicate_candidates dc
      LEFT JOIN participants p1 ON dc.primary_id = p1.participant_id
      LEFT JOIN participants p2 ON dc.duplicate_id = p2.participant_id
      WHERE ${whereClause};
    `, params);

    const totalCount = countRes.rows[0]?.count || 0;
    const offset = (page - 1) * pageSize;

    const dataParams = [...params, pageSize, offset];
    const dataRes = await db.query(`
      SELECT 
        dc.id,
        dc.primary_id,
        dc.duplicate_id,
        dc.match_criteria,
        dc.confidence,
        dc.status,
        dc.resolution_note,
        dc.resolved_by,
        dc.created_at,
        p1.name AS primary_name,
        p1.college AS primary_college,
        p1.contact AS primary_contact,
        p1.tshirt_size AS primary_tshirt,
        p2.name AS duplicate_name,
        p2.college AS duplicate_college,
        p2.contact AS duplicate_contact,
        p2.tshirt_size AS duplicate_tshirt
      FROM duplicate_candidates dc
      LEFT JOIN participants p1 ON dc.primary_id = p1.participant_id
      LEFT JOIN participants p2 ON dc.duplicate_id = p2.participant_id
      WHERE ${whereClause}
      ORDER BY dc.confidence DESC, dc.id ASC
      LIMIT $${pIdx} OFFSET $${pIdx + 1};
    `, dataParams);

    return NextResponse.json({
      success: true,
      summary: summaryRes.rows[0] || { total: 420, pending: 420, resolved: 0, dismissed: 0 },
      candidates: dataRes.rows,
      totalCount,
      page,
      pageSize,
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

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
      // Clear duplicate flag from participant so they become a fully valid distinct delegate
      await db.query(
        `UPDATE participants
         SET is_duplicate = FALSE, canonical_id = participant_id
         WHERE participant_id = $1;`,
        [duplicateId]
      );

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
