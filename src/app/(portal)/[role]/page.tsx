// FestOS Guarded Dynamic Role Route Segment
// Validates role parameter, enforces session identity, logs cross-role attempts, and renders portal client
// Zero em dashes or en dashes in any copy or comments

import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/jwt';
import { logAudit } from '@/lib/db';
import { RoleKey, ROLES } from '@/config/roles';
import { PortalClient } from './PortalClient';

const VALID_ROLES = Object.keys(ROLES) as RoleKey[];

interface RolePageProps {
  params: {
    role: string;
  };
}

export default async function RolePage({ params }: RolePageProps) {
  const targetRole = params.role as RoleKey;

  // 1. Validate route parameter against valid 8 roles
  if (!VALID_ROLES.includes(targetRole)) {
    notFound();
  }

  // 2. Extract and verify session from signed cookie
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    redirect(`/login?next=/${targetRole}`);
  }

  // 3. Enforce strict role isolation: redirect cross-role access to session home
  if (session.role !== targetRole) {
    // Log unauthorized navigation attempt to immutable audit log
    await logAudit({
      actorId: session.memberId,
      actorRole: session.role,
      action: 'UNAUTHORIZED_ROUTE_ATTEMPT',
      entityType: 'page_route',
      entityId: `/${targetRole}`,
      reason: `Cross-role access prevented: member "${session.memberId}" (${session.role}) attempted unauthorized access to "/${targetRole}"`,
    });

    redirect(`/${session.role}`);
  }

  // 4. Render verified role portal
  return <PortalClient session={session} />;
}

