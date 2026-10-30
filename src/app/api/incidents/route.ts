// Incidents reporting and resolution API
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    const res = await db.query(
      `SELECT i.id, i.reported_by, i.venue_id, i.description, i.severity, i.status, i.created_at, v.venue_name
       FROM incidents i
       LEFT JOIN venues v ON i.venue_id = v.venue_id
       ORDER BY i.created_at DESC LIMIT 50;`
    );
    return NextResponse.json(
      { success: true, incidents: res.rows },
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
    const { venueId, description, severity } = body;

    const trimmedDesc = (description || '').trim();
    if (!trimmedDesc || trimmedDesc.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'A non-empty incident description (minimum 5 characters) is mandatory.'
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const role = session.role;
    const actor = session.memberId;
    const incidentSeverity = severity || 'medium';
    const incidentId = `INC-${Date.now()}`;

    await db.query(
      `INSERT INTO incidents (id, reported_by, venue_id, description, severity, status)
       VALUES ($1, $2, $3, $4, $5, 'open');`,
      [incidentId, actor, venueId || null, trimmedDesc, incidentSeverity]
    );

    await logAudit({
      actorId: actor,
      actorRole: role,
      action: 'incident_reported',
      entityType: 'incidents',
      entityId: incidentId,
      reason: `Ground incident flagged: ${trimmedDesc}`,
      beforeState: null,
      afterState: { id: incidentId, severity: incidentSeverity, venue_id: venueId }
    });

    await broadcastInvalidation('director', 'live_incident_command');

    return NextResponse.json({
      success: true,
      incidentId,
      status: 'open',
      severity: incidentSeverity
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

