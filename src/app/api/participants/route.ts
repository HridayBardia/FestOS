import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { CANONICAL_DATASET } from '@/lib/canonicalData';
import { inMemoryDb } from '@/lib/inMemoryDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authenticate session (any core team member can query participants)
    const authRes = await requireSession(req);
    if ('status' in authRes) return authRes;

    const { searchParams } = new URL(req.url);

    // If requesting contingent metadata list
    if (searchParams.get('type') === 'contingents') {
      const contingentsRes = await db.query(`
        SELECT 
          c.contingent_id AS id,
          c.college AS name,
          c.college,
          c.leader_name,
          c.escort_name,
          c.strength_declared,
          c.preferences,
          COUNT(p.participant_id)::int AS total_members,
          COUNT(ci.participant_id)::int AS checked_in_count
        FROM contingents c
        LEFT JOIN participants p ON c.contingent_id = p.contingent_id
        LEFT JOIN check_ins ci ON p.participant_id = ci.participant_id AND ci.status = 'checked_in'
        GROUP BY c.contingent_id, c.college, c.leader_name, c.escort_name, c.strength_declared, c.preferences
        ORDER BY c.contingent_id ASC;
      `);

      return NextResponse.json(
        {
          success: true,
          data: contingentsRes.rows,
        },
        {
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // Pagination and query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = (searchParams.get('search') || '').trim();
    const contingentId = searchParams.get('contingentId') || 'all';
    const dietary = searchParams.get('dietary') || 'all';
    const accessibility = searchParams.get('accessibility') === 'true';
    const checkedIn = searchParams.get('checkedIn') || 'all';
    const gender = searchParams.get('gender') || 'all';

    // Build SQL query conditions
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.participant_id ILIKE $${paramIndex} OR p.contact ILIKE $${paramIndex} OR p.college ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (contingentId !== 'all') {
      conditions.push(`p.contingent_id = $${paramIndex}`);
      params.push(contingentId);
      paramIndex++;
    }

    if (dietary !== 'all') {
      if (dietary === 'veg') {
        conditions.push(`(p.dietary_needs ILIKE '%Vegetarian%' OR p.dietary_needs ILIKE '%Veg%')`);
      } else if (dietary === 'jain') {
        conditions.push(`p.dietary_needs ILIKE '%Jain%'`);
      } else if (dietary === 'vegan') {
        conditions.push(`p.dietary_needs ILIKE '%Vegan%'`);
      } else if (dietary === 'halal') {
        conditions.push(`p.dietary_needs ILIKE '%Halal%'`);
      } else if (dietary === 'non-veg') {
        conditions.push(`p.dietary_needs ILIKE '%Non-vegetarian%'`);
      } else {
        conditions.push(`p.dietary_needs ILIKE $${paramIndex}`);
        params.push(`%${dietary}%`);
        paramIndex++;
      }
    }

    if (accessibility) {
      conditions.push(`(p.accessibility_needs IS NOT NULL AND p.accessibility_needs != 'None' AND p.accessibility_needs != '')`);
    }

    if (checkedIn === 'checked_in') {
      conditions.push(`ci.status = 'checked_in'`);
    } else if (checkedIn === 'pending') {
      conditions.push(`(ci.status IS NULL OR ci.status != 'checked_in')`);
    }

    if (gender !== 'all') {
      conditions.push(`p.gender_as_given ILIKE $${paramIndex}`);
      params.push(`%${gender}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Count total matching records
    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM participants p
      LEFT JOIN contingents c ON p.contingent_id = c.contingent_id
      LEFT JOIN check_ins ci ON p.participant_id = ci.participant_id
      WHERE ${whereClause};
    `;

    const countRes = await db.query(countQuery, params);
    const totalCount = countRes.rows[0]?.count || 0;

    // Fetch paginated page
    const offset = (page - 1) * pageSize;
    const dataParams = [...params, pageSize, offset];

    const dataQuery = `
      SELECT 
        p.participant_id AS id,
        p.contingent_id,
        p.name,
        p.college,
        p.contact AS phone,
        COALESCE(p.canonical_id, LOWER(p.participant_id) || '@fest.iimidr.ac.in') AS email,
        COALESCE(p.gender_as_given, 'Unspecified') AS gender,
        COALESCE(NULLIF(p.dietary_needs, ''), 'none') AS dietary_requirements,
        CASE 
          WHEN p.accessibility_needs IS NOT NULL AND p.accessibility_needs != 'None' AND p.accessibility_needs != '' 
          THEN TRUE 
          ELSE FALSE 
        END AS accessibility_needs,
        NULLIF(p.accessibility_needs, 'None') AS accessibility_note,
        p.tshirt_size,
        p.arrival_datetime,
        p.departure_datetime,
        p.accommodation_requested,
        p.is_duplicate,
        p.validation_status,
        COALESCE(c.college, p.college) AS contingent_name,
        c.leader_name,
        CASE WHEN c.leader_name = p.name THEN 'leader' ELSE 'delegate' END AS role,
        CASE WHEN ci.status = 'checked_in' THEN TRUE ELSE FALSE END AS checked_in,
        ci.checked_in_at,
        ci.note AS wristband_serial,
        ba.assignment_type,
        ba.room_id,
        ba.property_id
      FROM participants p
      LEFT JOIN contingents c ON p.contingent_id = c.contingent_id
      LEFT JOIN check_ins ci ON p.participant_id = ci.participant_id
      LEFT JOIN bed_allocations ba ON p.participant_id = ba.participant_id AND ba.status = 'active'
      WHERE ${whereClause}
      ORDER BY p.participant_id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataRes = await db.query(dataQuery, dataParams);

    return NextResponse.json(
      {
        success: true,
        data: dataRes.rows,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (error: any) {
    console.warn('Participants API DB query fallback to canonical in-memory dataset:', error?.message);
    const { searchParams } = new URL(req.url);

    if (searchParams.get('type') === 'contingents') {
      const list = (CANONICAL_DATASET.contingents || []).map((c: any) => {
        const members = (CANONICAL_DATASET.participants || []).filter((p: any) => p.contingent_id === c.contingent_id);
        const total = members.length || parseInt(c.strength_declared, 10) || 1;
        const checkedInCount = members.filter((p: any) => inMemoryDb.checkIns.has(p.participant_id)).length;
        return {
          id: c.contingent_id,
          contingent_id: c.contingent_id,
          name: c.college,
          college: c.college,
          city: c.college ? c.college.split(' ')[0] : 'Indore',
          leader_name: c.leader || 'Leader',
          escort_name: c.escort || 'Faculty Escort',
          strength_declared: parseInt(c.strength_declared, 10) || total,
          total_members: total,
          checked_in_count: checkedInCount,
          preferences: c.preferences || 'no preference'
        };
      });
      return NextResponse.json({ success: true, data: list });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const contingentId = searchParams.get('contingentId') || 'all';
    const dietary = (searchParams.get('dietary') || 'all').toLowerCase();
    const accessibility = searchParams.get('accessibility') === 'true';
    const gender = (searchParams.get('gender') || 'all').toLowerCase();

    let list = CANONICAL_DATASET.participants || [];
    if (search) {
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.participant_id && p.participant_id.toLowerCase().includes(search)) ||
        (p.college && p.college.toLowerCase().includes(search)) ||
        (p.contact && p.contact.toLowerCase().includes(search))
      );
    }
    if (contingentId !== 'all') {
      list = list.filter(p => p.contingent_id === contingentId);
    }
    if (dietary !== 'all') {
      list = list.filter(p => (p.dietary_needs || '').toLowerCase().includes(dietary));
    }
    if (accessibility) {
      list = list.filter(p => Boolean(p.accessibility_needs && p.accessibility_needs !== 'None'));
    }
    if (gender !== 'all') {
      list = list.filter(p => (p.gender_as_given || '').toLowerCase().includes(gender));
    }

    const totalCount = list.length;
    const offset = (page - 1) * pageSize;
    const paged = list.slice(offset, offset + pageSize).map(p => ({
      id: p.participant_id,
      contingent_id: p.contingent_id,
      name: p.name,
      college: p.college,
      phone: p.contact,
      email: `${(p.participant_id || '').toLowerCase()}@fest.iimidr.ac.in`,
      gender: p.gender_as_given || 'Unspecified',
      dietary_requirements: p.dietary_needs || 'none',
      accessibility_needs: Boolean(p.accessibility_needs && p.accessibility_needs !== 'None'),
      accessibility_note: p.accessibility_needs !== 'None' ? p.accessibility_needs : null,
      tshirt_size: p.tshirt_size,
      arrival_datetime: p.arrival_datetime,
      departure_datetime: p.departure_datetime,
      accommodation_requested: p.accommodation_requested,
      validation_status: 'canonical_clean',
      contingent_name: p.college,
      leader_name: 'Contingent Leader',
      role: 'delegate',
      checked_in: false,
      checked_in_at: null,
      wristband_serial: null,
      assignment_type: null,
      room_id: null,
      property_id: null
    }));

    return NextResponse.json(
      {
        success: true,
        data: paged,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }
}

