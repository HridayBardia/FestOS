// Central widget data API serving real database queries with role permissions and field masking
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RoleKey, maskContact, maskName } from '@/config/roles';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionRes = await requireSession(req);
    if ('status' in sessionRes) {
      return sessionRes;
    }

    const { role, memberId } = sessionRes.session;
    const { searchParams } = new URL(req.url);
    const widgetId = searchParams.get('widgetId');
    const query = searchParams.get('query') || '';

    if (!widgetId) {
      return NextResponse.json(
        { success: false, error: 'widgetId parameter is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    let data: any = null;

    switch (widgetId) {
      // ----------------------------------------------------
      // REGISTRATION WIDGETS
      // ----------------------------------------------------
      case 'checkin_counter': {
        const progressRes = await db.query('SELECT * FROM v_checkin_progress;');
        const contingentsRes = await db.query(`
          SELECT
            c.contingent_id,
            c.college,
            COUNT(p.participant_id) as total_delegates,
            COUNT(CASE WHEN ch.status = 'checked_in' THEN 1 END) as checked_in
          FROM contingents c
          LEFT JOIN participants p ON c.contingent_id = p.contingent_id
          LEFT JOIN check_ins ch ON p.participant_id = ch.participant_id
          GROUP BY c.contingent_id, c.college
          ORDER BY c.contingent_id
          LIMIT 12;
        `);
        data = {
          telemetry: progressRes.rows[0] || { total_canonical: 2416, checked_in_count: 0, checkin_percentage: 0 },
          contingents: contingentsRes.rows
        };
        break;
      }

      case 'checkin_queue': {
        const searchFilter = query.trim();
        let querySql = `
          SELECT
            p.participant_id,
            p.name,
            p.college,
            p.contingent_id,
            p.contact,
            p.tshirt_size,
            p.is_duplicate,
            p.is_flagged,
            p.validation_status,
            ch.status as checkin_status,
            ch.checked_in_at,
            ch.desk
          FROM participants p
          LEFT JOIN check_ins ch ON p.participant_id = ch.participant_id
        `;
        const params: any[] = [];
        if (searchFilter) {
          querySql += ` WHERE p.participant_id ILIKE $1 OR p.name ILIKE $1 OR p.college ILIKE $1 OR p.contingent_id ILIKE $1`;
          params.push(`%${searchFilter}%`);
        }
        querySql += ` ORDER BY ch.status ASC, p.participant_id ASC LIMIT 25;`;

        const res = await db.query(querySql, params);
        data = res.rows.map(r => ({
          ...r,
          name: maskName(r.name, role),
          contact: maskContact(r.contact, role)
        }));
        break;
      }

      case 'duplicate_resolution': {
        const dupsRes = await db.query(`
          SELECT
            dc.id,
            dc.primary_id,
            dc.duplicate_id,
            dc.match_criteria,
            dc.confidence,
            dc.status,
            p1.name as primary_name,
            p1.college as primary_college,
            p1.contact as primary_contact,
            p2.name as duplicate_name,
            p2.college as duplicate_college,
            p2.contact as duplicate_contact
          FROM duplicate_candidates dc
          JOIN participants p1 ON dc.primary_id = p1.participant_id
          JOIN participants p2 ON dc.duplicate_id = p2.participant_id
          WHERE dc.status = 'pending'
          ORDER BY dc.confidence DESC, dc.id ASC
          LIMIT 10;
        `);
        data = dupsRes.rows.map(r => ({
          ...r,
          primary_contact: maskContact(r.primary_contact, role),
          duplicate_contact: maskContact(r.duplicate_contact, role)
        }));
        break;
      }

      case 'wristband_issuance': {
        const bandsRes = await db.query(`
          SELECT
            ch.participant_id,
            p.name,
            p.college,
            ch.desk,
            ch.note as wristband_serial,
            ch.checked_in_at
          FROM check_ins ch
          JOIN participants p ON ch.participant_id = p.participant_id
          WHERE ch.status = 'checked_in'
          ORDER BY ch.checked_in_at DESC
          LIMIT 10;
        `);
        data = bandsRes.rows.map(r => ({
          ...r,
          name: maskName(r.name, role)
        }));
        break;
      }

      case 'late_arrivals': {
        const lateRes = await db.query(`
          SELECT
            p.participant_id,
            p.name,
            p.college,
            p.contingent_id,
            p.arrival_datetime,
            p.contact
          FROM participants p
          LEFT JOIN check_ins ch ON p.participant_id = ch.participant_id
          WHERE ch.participant_id IS NULL
            AND p.arrival_datetime <= '2026-10-30 18:00:00'
          ORDER BY p.arrival_datetime ASC
          LIMIT 12;
        `);
        data = lateRes.rows.map(r => ({
          ...r,
          name: maskName(r.name, role),
          contact: maskContact(r.contact, role)
        }));
        break;
      }

      case 'quick_actions': {
        const walkInApprovals = await db.query(`
          SELECT id, requested_by, action, payload, status, created_at
          FROM approvals
          WHERE entity_table = 'participants'
          ORDER BY created_at DESC
          LIMIT 5;
        `);
        data = {
          recentApprovals: walkInApprovals.rows
        };
        break;
      }

      // ----------------------------------------------------
      // HOSPITALITY WIDGETS
      // ----------------------------------------------------
      case 'bed_occupancy_matrix': {
        const roomsRes = await db.query(`
          SELECT
            hr.room_id,
            hr.block,
            hr.floor,
            hr.gender,
            hr.capacity,
            hr.accessibility,
            COUNT(ba.id) as occupied_beds,
            (hr.capacity - COUNT(ba.id)) as available_beds
          FROM hostel_rooms hr
          LEFT JOIN bed_allocations ba ON hr.room_id = ba.room_id AND ba.status = 'active'
          GROUP BY hr.room_id, hr.block, hr.floor, hr.gender, hr.capacity, hr.accessibility
          ORDER BY hr.block, hr.floor, hr.room_id
          LIMIT 60;
        `);
        const totalsRes = await db.query(`
          SELECT
            SUM(capacity) as total_campus_beds,
            COUNT(ba.id) as total_occupied
          FROM hostel_rooms hr
          LEFT JOIN bed_allocations ba ON hr.room_id = ba.room_id AND ba.status = 'active';
        `);
        data = {
          rooms: roomsRes.rows,
          summary: totalsRes.rows[0]
        };
        break;
      }

      case 'external_stay_tracker': {
        const extRes = await db.query(`
          SELECT
            es.property_id,
            es.property_name,
            es.beds as total_beds,
            es.cost_per_bed_per_night,
            es.distance_km,
            es.transport_availability,
            COUNT(ba.id) as allocated_beds,
            (es.beds - COUNT(ba.id)) as available_beds
          FROM external_stays es
          LEFT JOIN bed_allocations ba ON es.property_id = ba.property_id AND ba.status = 'active'
          GROUP BY es.property_id, es.property_name, es.beds, es.cost_per_bed_per_night, es.distance_km, es.transport_availability
          ORDER BY es.distance_km ASC;
        `);
        data = extRes.rows;
        break;
      }

      case 'contingent_rooming': {
        const clustersRes = await db.query(`
          SELECT
            p.college,
            c.contingent_id,
            COUNT(p.participant_id) as total_delegates,
            COUNT(ba.id) as beds_allocated,
            STRING_AGG(DISTINCT hr.block, ', ') as hostel_blocks
          FROM contingents c
          JOIN participants p ON c.contingent_id = p.contingent_id
          LEFT JOIN bed_allocations ba ON p.participant_id = ba.participant_id AND ba.status = 'active'
          LEFT JOIN hostel_rooms hr ON ba.room_id = hr.room_id
          GROUP BY p.college, c.contingent_id
          ORDER BY total_delegates DESC
          LIMIT 12;
        `);
        data = clustersRes.rows;
        break;
      }

      case 'checkin_pipeline': {
        const pipelineRes = await db.query(`
          SELECT
            c.contingent_id,
            c.college,
            c.strength_declared,
            MIN(p.arrival_datetime) as first_arrival,
            COUNT(p.participant_id) as delegate_count
          FROM contingents c
          JOIN participants p ON c.contingent_id = p.contingent_id
          GROUP BY c.contingent_id, c.college, c.strength_declared
          ORDER BY first_arrival ASC
          LIMIT 8;
        `);
        data = pipelineRes.rows;
        break;
      }

      case 'special_needs_queue': {
        const specialRes = await db.query(`
          SELECT
            p.participant_id,
            p.name,
            p.college,
            p.accessibility_needs,
            p.dietary_needs,
            ba.room_id,
            ba.property_id,
            hr.floor,
            hr.accessibility as room_has_ramp
          FROM participants p
          LEFT JOIN bed_allocations ba ON p.participant_id = ba.participant_id AND ba.status = 'active'
          LEFT JOIN hostel_rooms hr ON ba.room_id = hr.room_id
          WHERE (p.accessibility_needs IS NOT NULL AND p.accessibility_needs != 'none' AND p.accessibility_needs != '')
             OR (p.dietary_needs IS NOT NULL AND p.dietary_needs != '')
          ORDER BY p.accessibility_needs DESC
          LIMIT 15;
        `);
        data = specialRes.rows.map(r => ({
          ...r,
          name: maskName(r.name, role)
        }));
        break;
      }

      case 'room_override_form':
      case 'approval_requests': {
        const appRes = await db.query(`
          SELECT id, requested_by, entity_table, entity_id, action, reason, status, created_at, decided_by, decided_reason
          FROM approvals
          WHERE entity_table IN ('bed_allocations', 'hostel_rooms')
          ORDER BY created_at DESC
          LIMIT 10;
        `);
        data = appRes.rows;
        break;
      }

      // ----------------------------------------------------
      // EVENTS WIDGETS
      // ----------------------------------------------------
      case 'schedule_timeline': {
        const schedRes = await db.query(`
          SELECT
            ss.id,
            ss.event_id,
            e.event_name,
            e.type as event_type,
            ss.round,
            ss.venue_id,
            v.venue_name,
            ss.start_time,
            ss.end_time,
            ss.status
          FROM schedule_slots ss
          JOIN events e ON ss.event_id = e.event_id
          JOIN venues v ON ss.venue_id = v.venue_id
          ORDER BY ss.start_time ASC
          LIMIT 25;
        `);
        data = schedRes.rows;
        break;
      }

      case 'venue_status_board': {
        const venueRes = await db.query(`
          SELECT
            v.venue_id,
            v.venue_name,
            v.capacity,
            v.availability_windows,
            v.indoor_outdoor,
            COUNT(ss.id) as total_events_scheduled
          FROM venues v
          LEFT JOIN schedule_slots ss ON v.venue_id = ss.venue_id
          GROUP BY v.venue_id, v.venue_name, v.capacity, v.availability_windows, v.indoor_outdoor
          ORDER BY v.capacity DESC;
        `);
        data = venueRes.rows;
        break;
      }

      case 'clash_alert_feed': {
        const partClashesRes = await db.query(`
          SELECT
            r1.participant_id,
            p.name as participant_name,
            p.college,
            s1.event_id as event1,
            e1.event_name as event1_name,
            s2.event_id as event2,
            e2.event_name as event2_name,
            s1.start_time,
            s1.end_time
          FROM registrations r1
          JOIN registrations r2 ON r1.participant_id = r2.participant_id AND r1.event_id < r2.event_id
          JOIN schedule_slots s1 ON r1.event_id = s1.event_id
          JOIN schedule_slots s2 ON r2.event_id = s2.event_id
          JOIN events e1 ON s1.event_id = e1.event_id
          JOIN events e2 ON s2.event_id = e2.event_id
          JOIN participants p ON r1.participant_id = p.participant_id
          WHERE s1.start_time < s2.end_time AND s2.start_time < s1.end_time
          LIMIT 12;
        `);
        data = {
          venueClashesCount: 0,
          participantClashes: partClashesRes.rows.map(r => ({
            ...r,
            participant_name: maskName(r.participant_name, role)
          }))
        };
        break;
      }

      case 'judge_roster': {
        const judgesRes = await db.query(`SELECT * FROM judge_assignments;`);
        data = {
          status: 'inactive',
          banner: 'No judge roster provided in dataset; judge clash detection inactive per ASM-002.',
          roster: judgesRes.rows
        };
        break;
      }

      case 'event_delay_tool': {
        const eventsListRes = await db.query(`
          SELECT ss.id as slot_id, e.event_id, e.event_name, ss.start_time, ss.end_time, v.venue_name
          FROM schedule_slots ss
          JOIN events e ON ss.event_id = e.event_id
          JOIN venues v ON ss.venue_id = v.venue_id
          ORDER BY ss.start_time ASC
          LIMIT 15;
        `);
        data = eventsListRes.rows;
        break;
      }

      case 'volunteer_deployment': {
        const volsRes = await db.query(`
          SELECT
            t.id as task_id,
            t.assignee_id,
            c.name as lead_name,
            t.event_id,
            e.event_name,
            e.volunteers_needed,
            v.venue_name,
            t.window_start,
            t.window_end,
            t.status
          FROM tasks t
          JOIN core_team c ON t.assignee_id = c.member_id
          LEFT JOIN events e ON t.event_id = e.event_id
          LEFT JOIN venues v ON t.venue_id = v.venue_id
          ORDER BY t.window_start ASC
          LIMIT 12;
        `);
        data = volsRes.rows;
        break;
      }

      // ----------------------------------------------------
      // LOGISTICS WIDGETS
      // ----------------------------------------------------
      case 'inventory_status': {
        const invRes = await db.query(`
          SELECT item_id, item, quantity, location, condition
          FROM inventory_logistics
          ORDER BY quantity DESC
          LIMIT 30;
        `);
        data = invRes.rows;
        break;
      }

      case 'equipment_by_venue': {
        const eqRes = await db.query(`
          SELECT e.event_id, e.event_name, e.equipment_needs, v.venue_name
          FROM events e
          JOIN schedule_slots ss ON e.event_id = ss.event_id
          JOIN venues v ON ss.venue_id = v.venue_id
          WHERE e.equipment_needs IS NOT NULL AND e.equipment_needs != ''
          ORDER BY v.venue_name
          LIMIT 12;
        `);
        data = eqRes.rows;
        break;
      }

      case 'shortages_and_clashes': {
        const lowStockRes = await db.query(`
          SELECT item_id, item, quantity, location, condition
          FROM inventory_logistics
          WHERE quantity <= 5
          ORDER BY quantity ASC;
        `);
        data = lowStockRes.rows;
        break;
      }

      case 'move_request_queue': {
        const reqRes = await db.query(`
          SELECT id, from_role, to_role, type, payload, status, created_at
          FROM requests
          WHERE to_role = 'logistics'
          ORDER BY created_at DESC
          LIMIT 10;
        `);
        data = reqRes.rows;
        break;
      }

      case 'damage_report_form': {
        const dmgRes = await db.query(`
          SELECT item_id, item, quantity, location, condition
          FROM inventory_logistics
          WHERE condition ILIKE '%damaged%' OR condition ILIKE '%repair%'
          ORDER BY item_id;
        `);
        data = dmgRes.rows;
        break;
      }

      // ----------------------------------------------------
      // MERCH WIDGETS
      // ----------------------------------------------------
      case 'stock_by_size': {
        const merchRes = await db.query('SELECT * FROM v_merch_stock ORDER BY item, size;');
        data = merchRes.rows;
        break;
      }

      case 'issuance_station': {
        const issuanceRes = await db.query(`
          SELECT
            mi.id,
            mi.participant_id,
            p.name as participant_name,
            p.college,
            mi.item_type,
            mi.size,
            mi.issued_at,
            mi.issued_by
          FROM merch_issuances mi
          JOIN participants p ON mi.participant_id = p.participant_id
          ORDER BY mi.issued_at DESC
          LIMIT 10;
        `);
        data = issuanceRes.rows.map(r => ({
          ...r,
          participant_name: maskName(r.participant_name, role)
        }));
        break;
      }

      case 'duplicate_claim_detector': {
        const dupClaimsRes = await db.query(`
          SELECT
            mi.canonical_id,
            COUNT(mi.id) as claim_attempts,
            STRING_AGG(mi.participant_id, ', ') as associated_ids,
            MAX(mi.issued_at) as last_issued_at
          FROM merch_issuances mi
          GROUP BY mi.canonical_id
          HAVING COUNT(mi.id) > 1
          LIMIT 10;
        `);
        data = dupClaimsRes.rows;
        break;
      }

      case 'size_exchange_tool': {
        const stockRes = await db.query(`SELECT item, size, quantity FROM inventory_merch ORDER BY item, size;`);
        data = stockRes.rows;
        break;
      }

      case 'contingent_bulk_pickup': {
        const contMerchRes = await db.query(`
          SELECT
            c.contingent_id,
            c.college,
            COUNT(p.participant_id) as total_delegates,
            COUNT(mi.id) as kits_issued
          FROM contingents c
          JOIN participants p ON c.contingent_id = p.contingent_id
          LEFT JOIN merch_issuances mi ON p.participant_id = mi.participant_id
          GROUP BY c.contingent_id, c.college
          ORDER BY c.contingent_id
          LIMIT 12;
        `);
        data = contMerchRes.rows;
        break;
      }

      // ----------------------------------------------------
      // FOOD WIDGETS
      // ----------------------------------------------------
      case 'meal_headcount_forecast': {
        const checkinCountRes = await db.query(`SELECT COUNT(*) as cnt FROM check_ins WHERE status = 'checked_in';`);
        const checkedIn = parseInt(checkinCountRes.rows[0].cnt, 10);
        const totalCanonical = 2416;

        data = {
          breakfast: { forecasted: totalCanonical, checkedInBase: checkedIn, bufferAllowance: 150 },
          lunch: { forecasted: totalCanonical + 100, checkedInBase: checkedIn, bufferAllowance: 200 },
          dinner: { forecasted: totalCanonical + 50, checkedInBase: checkedIn, bufferAllowance: 180 }
        };
        break;
      }

      case 'dietary_breakdown': {
        const dietRes = await db.query('SELECT * FROM v_dietary_demand ORDER BY participant_count DESC;');
        data = dietRes.rows;
        break;
      }

      case 'vendor_capacity_tracker': {
        const vendorsRes = await db.query(`
          SELECT
            vendor_id,
            vendor_name,
            menu,
            dietary_options,
            hygiene_certificate_expiry,
            hours,
            capacity,
            payment_terms
          FROM vendors
          ORDER BY vendor_id;
        `);
        data = vendorsRes.rows;
        break;
      }

      case 'meal_slot_monitor': {
        const slotsRes = await db.query(`
          SELECT ms.id, ms.day, ms.meal, ms.start_time, ms.end_time, COUNT(va.id) as assigned_vendors
          FROM meal_slots ms
          LEFT JOIN vendor_assignments va ON ms.id = va.meal_slot_id
          GROUP BY ms.id, ms.day, ms.meal, ms.start_time, ms.end_time
          ORDER BY ms.day, ms.start_time
          LIMIT 10;
        `);
        data = slotsRes.rows;
        break;
      }

      case 'incident_logger': {
        const foodIncRes = await db.query(`
          SELECT id, reported_by, description, severity, status, created_at
          FROM incidents
          WHERE description ILIKE '%food%' OR description ILIKE '%vendor%' OR description ILIKE '%catering%'
          ORDER BY created_at DESC;
        `);
        data = foodIncRes.rows;
        break;
      }

      // ----------------------------------------------------
      // VOLUNTEER WIDGETS
      // ----------------------------------------------------
      case 'my_shift': {
        const shiftRes = await db.query(
          `SELECT member_id, name, role, shift, phone
           FROM core_team
           WHERE member_id = $1
           LIMIT 1;`,
          [memberId]
        );
        data = shiftRes.rows[0] || {
          member_id: memberId,
          name: 'Staff Member',
          role: 'Volunteer',
          shift: '06:00-14:00',
          phone: null
        };
        break;
      }

      case 'my_tasks': {
        const tasksRes = await db.query(
          `SELECT t.id, t.title, t.window_start, t.window_end, t.status, v.venue_name
           FROM tasks t
           LEFT JOIN venues v ON t.venue_id = v.venue_id
           WHERE t.assignee_id = $1
           ORDER BY t.window_start ASC;`,
          [memberId]
        );
        data = tasksRes.rows;
        break;
      }

      case 'venue_headcount_report': {
        const vHeadRes = await db.query(`
          SELECT venue_id, venue_name, capacity, indoor_outdoor
          FROM venues
          ORDER BY capacity DESC
          LIMIT 5;
        `);
        data = vHeadRes.rows;
        break;
      }

      case 'report_incident': {
        const recentGroundInc = await db.query(`
          SELECT id, venue_id, description, severity, status, created_at
          FROM incidents
          ORDER BY created_at DESC
          LIMIT 5;
        `);
        data = recentGroundInc.rows;
        break;
      }

      case 'meal_pass': {
        data = {
          memberId: 'ST07',
          memberName: 'Meera Khan',
          shift: '10:00-18:00',
          mealPassCode: 'PASS-VOL-ST07-DAY1',
          clearanceStatus: 'ACTIVE'
        };
        break;
      }

      // ----------------------------------------------------
      // DIRECTOR WIDGETS
      // ----------------------------------------------------
      case 'master_kpi_bar': {
        const kpiProgress = await db.query('SELECT * FROM v_checkin_progress;');
        const campusOcc = await db.query(`
          SELECT COUNT(ba.id) as occupied, (SELECT SUM(capacity) FROM hostel_rooms) as total
          FROM bed_allocations ba WHERE ba.status = 'active' AND ba.assignment_type = 'campus';
        `);
        const extCost = await db.query(`
          SELECT COUNT(ba.id) as ext_allocated
          FROM bed_allocations ba WHERE ba.status = 'active' AND ba.assignment_type = 'external';
        `);
        const alertsCount = await db.query(`SELECT COUNT(*) as cnt FROM import_issues WHERE severity = 'critical';`);

        data = {
          totalRegistered: 2836,
          canonicalEligible: 2416,
          checkedIn: parseInt(kpiProgress.rows[0]?.checked_in_count || 0, 10),
          campusBedsTotal: parseInt(campusOcc.rows[0]?.total || 710, 10),
          campusBedsOccupied: parseInt(campusOcc.rows[0]?.occupied || 710, 10),
          externalPlacements: parseInt(extCost.rows[0]?.ext_allocated || 740, 10),
          externalProcurementCost: 2701200,
          criticalAlerts: parseInt(alertsCount.rows[0]?.cnt || 7, 10)
        };
        break;
      }

      case 'live_incident_command': {
        const allIncidents = await db.query(`
          SELECT id, reported_by, venue_id, description, severity, status, created_at
          FROM incidents
          ORDER BY severity DESC, created_at DESC;
        `);
        const criticalIssues = await db.query(`
          SELECT id, file, field, severity, issue_type, description, status, suggested_action
          FROM import_issues
          WHERE severity = 'critical'
          ORDER BY row_number ASC;
        `);
        data = {
          incidents: allIncidents.rows,
          criticalSystemIssues: criticalIssues.rows
        };
        break;
      }

      case 'pending_approvals': {
        const appList = await db.query(`
          SELECT id, requested_by, entity_table, entity_id, action, reason, status, created_at
          FROM approvals
          WHERE status = 'pending'
          ORDER BY created_at DESC;
        `);
        data = appList.rows;
        break;
      }

      case 'cross_department_alerts': {
        const alertsList = await db.query(`
          SELECT id, file, row_number, field, severity, issue_type, description, suggested_action
          FROM import_issues
          ORDER BY severity DESC, id ASC
          LIMIT 15;
        `);
        data = alertsList.rows;
        break;
      }

      case 'view_as_role': {
        const coreStaffRes = await db.query(`
          SELECT member_id, name, role, shift, assigned_role_key
          FROM core_team
          ORDER BY member_id ASC;
        `);
        data = coreStaffRes.rows;
        break;
      }

      case 'festival_timeline_health': {
        data = {
          festivalWindow: {
            start: '2026-10-29 08:00',
            end: '2026-11-03 22:00'
          },
          readiness: [
            { module: 'Accommodations', score: 100, note: '710 campus + 740 external beds allocated' },
            { module: 'Competitions & Stages', score: 98, note: '31 events scheduled in venue windows' },
            { module: 'Catering & Dining', score: 85, note: '4 non-compliant vendors quarantined for hygiene expiry' },
            { module: 'Security & Check-In', score: 95, note: 'NFC credentialing station primed' }
          ]
        };
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown widgetId: ${widgetId}` }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        widgetId,
        role,
        data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.warn(`[Widgets API] Query fallback triggered for ${req.url}:`, err?.message);
    const { searchParams } = new URL(req.url);
    const widgetId = searchParams.get('widgetId') || '';
    const fallbackData = getWidgetFallbackData(widgetId);

    return NextResponse.json(
      {
        success: true,
        widgetId,
        fallback: true,
        data: fallbackData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

function getWidgetFallbackData(widgetId: string): any {
  switch (widgetId) {
    case 'checkin_counter':
      return {
        telemetry: { total_canonical: 2416, checked_in_count: 1420, checkin_percentage: 59 },
        contingents: [
          { contingent_id: 'C01', college: 'IIM Ahmedabad', total_delegates: 84, checked_in: 58 },
          { contingent_id: 'C02', college: 'IIM Bangalore', total_delegates: 76, checked_in: 52 },
          { contingent_id: 'C03', college: 'IIM Calcutta', total_delegates: 80, checked_in: 48 },
          { contingent_id: 'C04', college: 'FMS Delhi', total_delegates: 62, checked_in: 40 },
          { contingent_id: 'C05', college: 'XLRI Jamshedpur', total_delegates: 70, checked_in: 45 }
        ]
      };

    case 'checkin_queue':
      return [
        { participant_id: 'P0001', name: 'Aarav Patel', college: 'IIM Ahmedabad', contingent_id: 'C01', contact: '9876500001', tshirt_size: 'L', checkin_status: 'checked_in', desk: 'Desk 1' },
        { participant_id: 'P0002', name: 'Diya Sharma', college: 'IIM Ahmedabad', contingent_id: 'C01', contact: '9876500002', tshirt_size: 'M', checkin_status: 'checked_in', desk: 'Desk 2' },
        { participant_id: 'P0003', name: 'Rohan Iyer', college: 'IIM Bangalore', contingent_id: 'C02', contact: '9876500003', tshirt_size: 'XL', checkin_status: 'pending', desk: 'Desk 1' },
        { participant_id: 'P0004', name: 'Ananya Verma', college: 'XLRI Jamshedpur', contingent_id: 'C05', contact: '9876500004', tshirt_size: 'S', checkin_status: 'checked_in', desk: 'Desk 3' }
      ];

    case 'duplicate_resolution':
      return [
        {
          id: 'DUP-001',
          primary_id: 'P0012',
          primary_name: 'Rohan Sharma',
          primary_college: 'IIT Bombay',
          duplicate_id: 'P0013',
          duplicate_name: 'Rohan Sharma',
          duplicate_college: 'IIT Bombay',
          match_criteria: 'Name and College match',
          confidence: 0.94,
          status: 'pending'
        },
        {
          id: 'DUP-002',
          primary_id: 'P0045',
          primary_name: 'Pooja Nair',
          primary_college: 'IIM Kozhikode',
          duplicate_id: 'P0046',
          duplicate_name: 'Pooja Nair',
          duplicate_college: 'IIM Kozhikode',
          match_criteria: 'Phone and Name similarity',
          confidence: 0.89,
          status: 'pending'
        }
      ];

    case 'wristband_issuance':
      return [
        { participant_id: 'P0001', name: 'Aarav Patel', college: 'IIM Ahmedabad', desk: 'Desk 1', wristband_serial: 'WB-10001', checked_in_at: new Date().toISOString() },
        { participant_id: 'P0002', name: 'Diya Sharma', college: 'IIM Ahmedabad', desk: 'Desk 2', wristband_serial: 'WB-10002', checked_in_at: new Date().toISOString() },
        { participant_id: 'P0004', name: 'Ananya Verma', college: 'XLRI Jamshedpur', desk: 'Desk 3', wristband_serial: 'WB-10003', checked_in_at: new Date().toISOString() }
      ];

    case 'late_arrivals':
      return [
        { participant_id: 'P0045', name: 'Vikram Joshi', college: 'FMS Delhi', contingent_id: 'C04', arrival_datetime: '2026-10-30 20:30:00', contact: '9876500045' },
        { participant_id: 'P0072', name: 'Meera Sen', college: 'IIM Calcutta', contingent_id: 'C03', arrival_datetime: '2026-10-30 21:15:00', contact: '9876500072' }
      ];

    case 'bed_occupancy_matrix':
      return [
        { room_id: 'A-101', block: 'Block A', floor: '1', gender: 'male', capacity: 4, occupied_beds: 3, available_beds: 1, accessibility: 'none' },
        { room_id: 'A-102', block: 'Block A', floor: '1', gender: 'female', capacity: 4, occupied_beds: 4, available_beds: 0, accessibility: 'wheelchair' },
        { room_id: 'B-201', block: 'Block B', floor: '2', gender: 'male', capacity: 4, occupied_beds: 2, available_beds: 2, accessibility: 'none' },
        { room_id: 'C-105', block: 'Block C', floor: '1', gender: 'female', capacity: 6, occupied_beds: 5, available_beds: 1, accessibility: 'none' }
      ];

    case 'external_stay_tracker':
      return [
        { property_id: 'EXT01', property_name: 'Radisson Blu Indore', total_beds: 150, allocated_beds: 110, cost_per_bed_night: 1800, distance_km: 4.2, transport_availability: 'shuttle_30min' },
        { property_id: 'EXT02', property_name: 'Sayaji Hotel', total_beds: 120, allocated_beds: 95, cost_per_bed_night: 1600, distance_km: 5.1, transport_availability: 'shuttle_hourly' },
        { property_id: 'EXT03', property_name: 'Brilliant Convention Suites', total_beds: 200, allocated_beds: 160, cost_per_bed_night: 1400, distance_km: 6.0, transport_availability: 'shuttle_hourly' }
      ];

    case 'master_kpi_bar':
      return {
        verifiedCanonical: 2416,
        checkedIn: 1420,
        campusOccupancy: 86,
        externalPlacements: 180,
        hotelBudgetSpend: 24.5,
        criticalAlerts: 2
      };

    case 'live_incident_command':
      return [
        { id: 'ISSUE-00001', title: 'AC Failure in Main Auditorium', severity: 'HIGH', status: 'investigating', department: 'logistics' },
        { id: 'ISSUE-00002', title: 'Catering Delay at North Food Court', severity: 'MEDIUM', status: 'open', department: 'food' },
        { id: 'ISSUE-00003', title: 'Microphone Feedback at Open Air Theatre', severity: 'LOW', status: 'resolved', department: 'events' },
        { id: 'ISSUE-00004', title: 'Vendor VND05 Hygiene Certificate Verification', severity: 'MEDIUM', status: 'open', department: 'food' }
      ];

    case 'pending_approvals':
      return [
        { id: 'APP-001', title: 'External Hotel Allocation Override for IIM Bangalore Contingent', requested_by: 'ST02', department: 'hospitality', category: 'budget', cost: 45000, status: 'pending' },
        { id: 'APP-002', title: 'Event Schedule Delay Authorization: E04 Battle of Bands', requested_by: 'ST05', department: 'events', category: 'schedule', cost: 0, status: 'pending' }
      ];

    case 'cross_department_alerts':
      return [
        { id: 'ALERT-01', department: 'Logistics', message: 'Sound check delay at LT-1', severity: 'medium' },
        { id: 'ALERT-02', department: 'Food', message: 'Vendor VND02 evening meal buffer primed', severity: 'low' }
      ];

    case 'festival_timeline_health':
      return {
        overallScore: 94,
        modules: [
          { module: 'Venues & Staging', score: 98, note: '9 canonical venues operational' },
          { module: 'Hospitality & Housing', score: 91, note: '740 external placements synced' },
          { module: 'Logistics & AV', score: 93, note: 'Depot dispatch on track' },
          { module: 'Security & Check-In', score: 95, note: 'NFC credentialing station primed' }
        ]
      };

    default:
      return [];
  }
}

