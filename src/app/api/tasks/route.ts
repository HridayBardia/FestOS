// Volunteer tasks and venue headcount reporting API
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'events', 'volunteer']);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const { searchParams } = new URL(req.url);
    const targetAssignee = session.role === 'volunteer' ? session.memberId : (searchParams.get('assigneeId') || session.memberId);

    const res = await db.query(
      `SELECT t.id, t.assignee_id, t.venue_id, t.event_id, t.title, t.window_start, t.window_end, t.status, t.completed_at, v.venue_name, e.event_name
       FROM tasks t
       LEFT JOIN venues v ON t.venue_id = v.venue_id
       LEFT JOIN events e ON t.event_id = e.event_id
       WHERE t.assignee_id = $1
       ORDER BY t.window_start ASC;`,
      [targetAssignee]
    );

    return NextResponse.json(
      { success: true, tasks: res.rows },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'events', 'volunteer']);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { actionType, taskId, venueId, headcount, note } = body;

    const role = session.role;
    const actor = session.memberId;

    // Branch 1: Mark Task Completed
    if (actionType === 'complete_task') {
      if (!taskId) {
        return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
      }

      await db.query(
        `UPDATE tasks
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE id = $1;`,
        [taskId]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'volunteer_task_completed',
        entityType: 'tasks',
        entityId: taskId,
        reason: 'Shift duty task verified and marked completed on the ground',
        beforeState: { status: 'pending' },
        afterState: { status: 'completed' }
      });

      await broadcastInvalidation('volunteer', 'my_tasks');

      return NextResponse.json({ success: true, taskId, status: 'completed' });
    }

    // Branch 2: Venue Headcount Report
    if (actionType === 'report_headcount') {
      const count = parseInt(headcount, 10);
      if (isNaN(count) || count < 0) {
        return NextResponse.json({ success: false, error: 'Valid positive headcount number is required' }, { status: 400 });
      }

      const reportNote = (note || `Volunteer observed headcount of ${count} attendees at venue ${venueId}`).trim();

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'venue_headcount_reported',
        entityType: 'venues',
        entityId: venueId || 'general',
        reason: reportNote,
        beforeState: null,
        afterState: { venue_id: venueId, headcount: count }
      });

      return NextResponse.json({ success: true, venueId, headcount: count });
    }

    return NextResponse.json({ success: false, error: 'Unsupported actionType' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

