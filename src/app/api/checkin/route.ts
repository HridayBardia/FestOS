// Participant check-in and wristband credentialing API
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
    const { participantId, desk, wristbandSerial } = body;

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const role = session.role;
    const actor = session.memberId;
    const activeDesk = desk || 'Main Registration Desk 1';
    const serial = wristbandSerial || `WB-${participantId}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Verify participant exists
    const partRes = await db.query(`SELECT * FROM participants WHERE participant_id = $1;`, [participantId]);
    if (partRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }

    const participant = partRes.rows[0];

    // Check if already checked in
    const checkinRes = await db.query(`SELECT * FROM check_ins WHERE participant_id = $1;`, [participantId]);
    if (checkinRes.rows.length > 0 && checkinRes.rows[0].status === 'checked_in') {
      return NextResponse.json({
        success: false,
        error: `Participant ${participantId} is already checked in with wristband ${checkinRes.rows[0].note || 'N/A'}`
      }, { status: 400 });
    }

    // Insert or update check-in record
    await db.query(
      `INSERT INTO check_ins (participant_id, status, checked_in_at, actor_id, desk, note)
       VALUES ($1, 'checked_in', CURRENT_TIMESTAMP, $2, $3, $4)
       ON CONFLICT (participant_id)
       DO UPDATE SET status = 'checked_in', checked_in_at = CURRENT_TIMESTAMP, actor_id = $2, desk = $3, note = $4;`,
      [participantId, actor, activeDesk, serial]
    );

    // Write audit log
    await logAudit({
      actorId: actor,
      actorRole: role,
      action: 'participant_checkin',
      entityType: 'participants',
      entityId: participantId,
      reason: `NFC physical check-in credentialing verified at ${activeDesk}`,
      beforeState: { checked_in: false },
      afterState: { checked_in: true, wristband: serial, desk: activeDesk }
    });

    // Broadcast invalidation for real-time clients
    await broadcastInvalidation(role, 'checkin_progress');

    return NextResponse.json(
      {
        success: true,
        participantId,
        status: 'checked_in',
        wristbandSerial: serial
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

