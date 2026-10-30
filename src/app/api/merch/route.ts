// Merchandise issuance and size exchange API
// Enforces canonical uniqueness: UNIQUE(canonical_id, item_type)
// Zero em dashes or en dashes in any UI copy or metadata

import { NextRequest, NextResponse } from 'next/server';
import { db, logAudit, broadcastInvalidation } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authRes = await requireRole(req, ['director', 'merch']);
    if ('status' in authRes) return authRes;

    const { session } = authRes;
    const body = await req.json();
    const { actionType, participantId, itemType, size, exchangeReason } = body;

    const role = session.role;
    const actor = session.memberId;
    const item = itemType || 'Festival Kit & Hoodie';
    const chosenSize = (size || 'M').trim().toUpperCase();

    // Find participant and canonical_id
    const partRes = await db.query(
      `SELECT participant_id, canonical_id, name, tshirt_size FROM participants WHERE participant_id = $1;`,
      [participantId]
    );

    if (partRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Participant not found' }, { status: 404 });
    }

    const participant = partRes.rows[0];
    const canonicalId = participant.canonical_id || participant.participant_id;

    // Branch 1: Merchandise Issuance
    if (actionType === 'issue') {
      // Check if canonical participant already claimed
      const claimRes = await db.query(
        `SELECT * FROM merch_issuances WHERE canonical_id = $1 AND item_type = $2;`,
        [canonicalId, item]
      );

      if (claimRes.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Duplicate merchandise claim blocked: Canonical delegate ${canonicalId} has already received ${item} on ${claimRes.rows[0].issued_at}.`
        }, { status: 400 });
      }

      // Check stock
      const stockRes = await db.query(
        `SELECT quantity FROM inventory_merch WHERE item = $1 AND size = $2;`,
        [item, chosenSize]
      );
      if (stockRes.rows.length === 0 || stockRes.rows[0].quantity <= 0) {
        return NextResponse.json({
          success: false,
          error: `Insufficient merchandise stock for ${item} in size ${chosenSize}.`
        }, { status: 400 });
      }

      const issuanceId = `ISS-${Date.now()}`;
      await db.query(
        `INSERT INTO merch_issuances (id, participant_id, canonical_id, item_type, size, issued_by)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [issuanceId, participantId, canonicalId, item, chosenSize, actor]
      );

      // Decrement stock
      await db.query(
        `UPDATE inventory_merch SET quantity = quantity - 1 WHERE item = $1 AND size = $2;`,
        [item, chosenSize]
      );

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'merch_issuance',
        entityType: 'merch_issuances',
        entityId: issuanceId,
        reason: `Merchandise kit issued to participant ${participantId} (Size: ${chosenSize})`,
        beforeState: null,
        afterState: { issuance_id: issuanceId, participant_id: participantId, size: chosenSize }
      });

      await broadcastInvalidation('merch', 'stock_by_size');

      return NextResponse.json({
        success: true,
        issuanceId,
        participantId,
        item,
        size: chosenSize
      });
    }

    // Branch 2: Size Exchange
    if (actionType === 'exchange') {
      const trimmedReason = (exchangeReason || '').trim();
      if (!trimmedReason || trimmedReason.length < 5) {
        return NextResponse.json({
          success: false,
          error: 'A non-empty size exchange justification reason (minimum 5 characters) is mandatory.'
        }, { status: 400 });
      }

      const existingRes = await db.query(
        `SELECT * FROM merch_issuances WHERE canonical_id = $1 AND item_type = $2;`,
        [canonicalId, item]
      );

      if (existingRes.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No existing merchandise issuance record found for participant ${participantId} to exchange.`
        }, { status: 400 });
      }

      const existing = existingRes.rows[0];
      const oldSize = existing.size;

      // Check stock of new size
      const newStockRes = await db.query(
        `SELECT quantity FROM inventory_merch WHERE item = $1 AND size = $2;`,
        [item, chosenSize]
      );
      if (newStockRes.rows.length === 0 || newStockRes.rows[0].quantity <= 0) {
        return NextResponse.json({
          success: false,
          error: `Cannot exchange: No stock available for size ${chosenSize}.`
        }, { status: 400 });
      }

      // Restock old size, decrement new size, update issuance record
      await db.query(`UPDATE inventory_merch SET quantity = quantity + 1 WHERE item = $1 AND size = $2;`, [item, oldSize]);
      await db.query(`UPDATE inventory_merch SET quantity = quantity - 1 WHERE item = $1 AND size = $2;`, [item, chosenSize]);
      await db.query(`UPDATE merch_issuances SET size = $1 WHERE id = $2;`, [chosenSize, existing.id]);

      await logAudit({
        actorId: actor,
        actorRole: role,
        action: 'merch_size_exchange',
        entityType: 'merch_issuances',
        entityId: existing.id,
        reason: trimmedReason,
        beforeState: { size: oldSize },
        afterState: { size: chosenSize, exchange_reason: trimmedReason }
      });

      await broadcastInvalidation('merch', 'stock_by_size');

      return NextResponse.json({
        success: true,
        issuanceId: existing.id,
        oldSize,
        newSize: chosenSize
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported actionType' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

