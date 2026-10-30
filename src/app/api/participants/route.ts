import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';

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
    console.error('Participants API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to query participants' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

