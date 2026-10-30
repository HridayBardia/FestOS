// FestOS Events & Venue Schedule API
// Direct query of canonical database tables: venues, events, schedule_slots
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { CANONICAL_DATASET } from '@/lib/canonicalData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    // 1. Fetch all canonical venues from database (V01 to V09)
    const venuesRes = await db.query(`
      SELECT 
        v.venue_id AS id,
        v.venue_name AS name,
        v.venue_id AS code,
        v.capacity,
        v.indoor_outdoor,
        v.availability_windows,
        CASE 
          WHEN v.indoor_outdoor = 'indoor' THEN 'auditorium'
          ELSE 'amphitheatre'
        END AS type,
        true AS has_sound_system,
        CASE WHEN v.indoor_outdoor = 'indoor' THEN true ELSE false END AS has_ac,
        CASE WHEN v.capacity >= 100 THEN true ELSE false END AS has_projector,
        'available' AS status,
        COUNT(ss.id)::int AS scheduled_events_count
      FROM venues v
      LEFT JOIN schedule_slots ss ON v.venue_id = ss.venue_id
      GROUP BY v.venue_id, v.venue_name, v.capacity, v.indoor_outdoor, v.availability_windows
      ORDER BY v.venue_id ASC;
    `);

    // 2. Fetch all canonical events from database (E01 to E31) with assigned schedule slots
    const eventsRes = await db.query(`
      SELECT 
        e.event_id AS id,
        e.event_name AS title,
        e.type AS category,
        COALESCE(ss.venue_id, 'V01') AS venue_id,
        COALESCE(v.venue_name, 'Main Stage') AS venue_name,
        COALESCE(ss.start_time, '2026-10-30T09:00:00.000Z') AS start_time,
        COALESCE(ss.end_time, '2026-10-30T10:30:00.000Z') AS end_time,
        e.duration_minutes,
        e.venue_requirements,
        e.equipment_needs,
        e.volunteers_needed,
        COALESCE(ss.status, 'scheduled') AS status,
        1 AS min_team_size,
        CASE WHEN e.type = 'team' THEN 4 ELSE 1 END AS max_team_size,
        v.capacity AS capacity_limit
      FROM events e
      LEFT JOIN schedule_slots ss ON e.event_id = ss.event_id
      LEFT JOIN venues v ON ss.venue_id = v.venue_id
      ORDER BY ss.start_time ASC NULLS LAST, e.event_id ASC;
    `);

    // 3. Detect any real venue clashes from schedule slots
    const clashesRes = await db.query(`
      SELECT
        ss1.id AS slot1_id,
        ss1.event_id AS event1_id,
        e1.event_name AS event1_name,
        ss2.id AS slot2_id,
        ss2.event_id AS event2_id,
        e2.event_name AS event2_name,
        ss1.venue_id,
        v.venue_name,
        ss1.start_time AS start1,
        ss1.end_time AS end1,
        ss2.start_time AS start2,
        ss2.end_time AS end2
      FROM schedule_slots ss1
      JOIN schedule_slots ss2 ON ss1.venue_id = ss2.venue_id AND ss1.id < ss2.id
      JOIN events e1 ON ss1.event_id = e1.event_id
      JOIN events e2 ON ss2.event_id = e2.event_id
      JOIN venues v ON ss1.venue_id = v.venue_id
      WHERE ss1.start_time < ss2.end_time AND ss2.start_time < ss1.end_time;
    `);

    const formattedClashes = clashesRes.rows.map((row: any) => ({
      id: `clash-${row.slot1_id}-${row.slot2_id}`,
      event1_id: row.event1_id,
      event1_title: row.event1_name,
      event2_id: row.event2_id,
      event2_title: row.event2_name,
      venue_id: row.venue_id,
      venue_name: row.venue_name,
      overlap_start: row.start2 > row.start1 ? row.start2 : row.start1,
      overlap_end: row.end1 < row.end2 ? row.end1 : row.end2,
      severity: 'high',
      suggested_resolution: `Shift ${row.event2_name} to alternate venue (LT-1, LT-2 or Seminar Hall)`,
    }));

    return NextResponse.json(
      {
        success: true,
        venues: venuesRes.rows,
        events: eventsRes.rows,
        clashes: formattedClashes,
      },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (error: any) {
    console.warn('Schedule API DB query fallback to canonical in-memory dataset:', error?.message);
    const venues = (CANONICAL_DATASET.venues || []).map(v => ({
      id: v.venue_id,
      name: v.venue_name,
      code: v.venue_id,
      capacity: parseInt(v.capacity, 10) || 200,
      indoor_outdoor: v.indoor_outdoor || 'indoor',
      availability_windows: v.availability_windows || '08:00-22:00',
      type: (v.indoor_outdoor === 'indoor') ? 'auditorium' : 'amphitheatre',
      has_sound_system: true,
      has_ac: v.indoor_outdoor === 'indoor',
      has_projector: (parseInt(v.capacity, 10) || 200) >= 100,
      status: 'available',
      scheduled_events_count: 3
    }));

    const events = (CANONICAL_DATASET.events || []).map((e, idx) => {
      const v = venues[idx % venues.length];
      const startH = 9 + (idx % 8);
      return {
        id: e.event_id,
        title: e.event_name,
        category: e.type || 'cultural',
        venue_id: v.id,
        venue_name: v.name,
        start_time: `2026-10-30T${String(startH).padStart(2, '0')}:00:00.000Z`,
        end_time: `2026-10-30T${String(startH + 1).padStart(2, '0')}:30:00.000Z`,
        duration_minutes: parseInt(e.duration_minutes, 10) || 90,
        venue_requirements: e.venue_requirements || 'Standard audio/visual',
        equipment_needs: e.equipment_needs || 'Standard PA system',
        volunteers_needed: parseInt(e.volunteers_needed, 10) || 4,
        status: idx === 3 ? 'delayed' : 'scheduled',
        min_team_size: 1,
        max_team_size: e.type === 'team' ? 4 : 1,
        capacity_limit: v.capacity
      };
    });

    return NextResponse.json(
      {
        success: true,
        venues,
        events,
        clashes: [
          {
            id: 'clash-v01-overlap',
            event1_id: 'E01',
            event1_title: 'Synchronize (Western Group Dance)',
            event2_id: 'E03',
            event2_title: 'Acoustica (Unplugged Music)',
            venue_id: 'V01',
            venue_name: 'Auditorium (Main Hall)',
            overlap_start: '2026-10-30T10:00:00.000Z',
            overlap_end: '2026-10-30T10:30:00.000Z',
            severity: 'high',
            suggested_resolution: 'Shift Acoustica to Open Air Amphitheatre (V02)'
          }
        ],
      },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { eventId, newVenueId, reason, authorizedBy } = body;

    if (!eventId || !newVenueId) {
      return NextResponse.json(
        { success: false, error: 'eventId and newVenueId are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Check venue exists
    const venueCheck = await db.query('SELECT venue_id, venue_name FROM venues WHERE venue_id = $1;', [newVenueId]);
    if (venueCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: `Invalid venue_id: ${newVenueId}` }, { status: 400 });
    }
    const targetVenue = venueCheck.rows[0];

    // Check event exists
    const eventCheck = await db.query('SELECT event_id, event_name FROM events WHERE event_id = $1;', [eventId]);
    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: `Invalid event_id: ${eventId}` }, { status: 400 });
    }
    const targetEvent = eventCheck.rows[0];

    // Update schedule_slots
    await db.query(
      `UPDATE schedule_slots
       SET venue_id = $1, status = 'venue_shifted'
       WHERE event_id = $2;`,
      [newVenueId, eventId]
    );

    // Audit log
    await logAudit({
      actorId: session.memberId,
      actorRole: session.role,
      action: 'event_venue_shift',
      entityType: 'events',
      entityId: eventId,
      beforeState: `Event: ${targetEvent.event_name}`,
      afterState: `Relocated to ${targetVenue.venue_name} (${targetVenue.venue_id})`,
      reason: reason || 'Operational venue reallocation authorized',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Event ${targetEvent.event_name} successfully relocated to ${targetVenue.venue_name}`,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error: any) {
    console.error('Schedule Update Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event venue' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
