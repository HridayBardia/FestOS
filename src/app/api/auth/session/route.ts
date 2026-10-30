// Session information endpoint
// Returns {memberId, name, role, shift} from the verified JWT cookie only
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify account is active in database if available
    try {
      const userCheck = await db.query(
        'SELECT is_active FROM app_users WHERE login_id = $1;',
        [session.memberId]
      );
      if (userCheck.rows.length > 0 && !userCheck.rows[0].is_active) {
        return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 401 });
      }
    } catch (e) {
      // In-memory session verified
    }

    return NextResponse.json(
      {
        success: true,
        memberId: session.memberId,
        name: session.name,
        role: session.role,
        shift: session.shift,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
