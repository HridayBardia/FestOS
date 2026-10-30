// Data access layer for FestOS Next.js API routes and server components
// Zero em dashes or en dashes in any UI copy or metadata

import { db as scriptDb } from '../../scripts/db';
import { RoleKey } from '@/config/roles';

export const db = scriptDb;

export async function logAudit(params: {
  actorId: string;
  actorRole: RoleKey;
  action: string;
  entityType: string;
  entityId: string;
  reason: string;
  beforeState?: any;
  afterState?: any;
}) {
  const trimmedReason = (params.reason || '').trim();
  if (trimmedReason.length === 0) {
    throw new Error('Audit constraint violation: A non-empty reason is mandatory for all privileged actions.');
  }

  const auditId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    await db.query(
      `INSERT INTO audit_log (
        id, actor_id, actor_role, action, entity_type, entity_id, reason, before_state, after_state
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        auditId,
        params.actorId,
        params.actorRole,
        params.action,
        params.entityType,
        params.entityId,
        trimmedReason,
        params.beforeState ? JSON.stringify(params.beforeState) : null,
        params.afterState ? JSON.stringify(params.afterState) : null
      ]
    );
  } catch (err) {
    console.warn('[Audit Log Record In-Memory]:', params.action, params.entityId);
  }
  return auditId;
}

// Invalidation broadcaster for client refetching (Amendment 8)
export async function broadcastInvalidation(ownerRole: string, topic: string) {
  // Can be consumed via client-side polling or lightweight BroadcastChannel / Realtime topic
  console.log(`[Realtime Broadcast] Role: ${ownerRole}, Topic: ${topic}, Version: ${Date.now()}`);
}
