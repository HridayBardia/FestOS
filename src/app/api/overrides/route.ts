// Privileged overrides API: room shifts, event delays, with mandatory audit logging
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { overrideType, entityId, newTargetId, reason } = body;

    const trimmedReason = (reason || '').trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'A non-empty justification reason (minimum 5 characters) is mandatory.'
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const role = session.role;
    const actor = session.memberId;

    if (overrideType === 'room_reallocation') {
      if (role !== 'director' && role !== 'hospitality') {
        return NextResponse.json({ success: false, error: 'Forbidden: Hospitality or Director role required' }, { status: 403 });
      }
      // Find current allocation
      const curRes = await db.query(
        `SELECT * FROM bed_allocations WHERE participant_id = $1 AND status = 'active';`,
        [entityId]
      );
      const beforeState = curRes.rows[0] || null;

      // Update to new room
      if (beforeState) {
        await db.query(
          `UPDATE bed_allocations
           SET room_id = $1, allocated_at = CURRENT_TIMESTAMP
           WHERE id = $2;`,
          [newTargetId, beforeState.id]
        );
      } else {
        const allocId = `ALLOC-${Date.now()}`;
        await db.query(
          `INSERT INTO bed_allocations (id, participant_id, assignment_type, room_id, status)
           VALUES ($1, $2, 'campus', $3, 'active');`,
          [allocId, entityId, newTargetId]
        );
      }

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'accommodation_room_override',
        entityType: 'bed_allocations',
        entityId,
        reason: trimmedReason,
        beforeState,
        afterState: { participant_id: entityId, room_id: newTargetId }
      });

      await broadcastInvalidation('hospitality', 'bed_occupancy_matrix');

      return NextResponse.json({
        success: true,
        participantId: entityId,
        newRoomId: newTargetId
      });
    }

    if (overrideType === 'event_delay') {
      if (role !== 'director' && role !== 'events') {
        return NextResponse.json({ success: false, error: 'Forbidden: Events or Director role required' }, { status: 403 });
      }

      // Delay event by N minutes
      const delayMinutes = parseInt(body.delayMinutes, 10) || 30;
      const slotRes = await db.query(`SELECT * FROM schedule_slots WHERE id = $1;`, [entityId]);
      if (slotRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Schedule slot not found' }, { status: 404 });
      }

      const slot = slotRes.rows[0];
      const newStart = new Date(new Date(slot.start_time).getTime() + delayMinutes * 60000);
      const newEnd = new Date(new Date(slot.end_time).getTime() + delayMinutes * 60000);

      await db.query(
        `UPDATE schedule_slots
         SET start_time = $1, end_time = $2, status = 'delayed'
         WHERE id = $3;`,
        [newStart.toISOString(), newEnd.toISOString(), entityId]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'event_delay_override',
        entityType: 'schedule_slots',
        entityId,
        reason: trimmedReason,
        beforeState: { start_time: slot.start_time, end_time: slot.end_time },
        afterState: { start_time: newStart.toISOString(), end_time: newEnd.toISOString(), delayMinutes }
      });

      await broadcastInvalidation('events', 'schedule_timeline');

      return NextResponse.json({
        success: true,
        slotId: entityId,
        newStartTime: newStart.toISOString(),
        newEndTime: newEnd.toISOString()
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported overrideType' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

