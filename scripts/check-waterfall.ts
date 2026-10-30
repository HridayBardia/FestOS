import { db } from './db';

async function checkWaterfall() {
  // Check how many participants have registrations
  const regCounts = await db.query(`
    SELECT
      COUNT(DISTINCT p.participant_id) as total_participants,
      COUNT(DISTINCT r.participant_id) as participants_with_reg,
      COUNT(p.participant_id) - COUNT(DISTINCT r.participant_id) as participants_without_reg
    FROM raw_participants p
    LEFT JOIN raw_registrations r ON p.participant_id = r.participant_id;
  `);
  console.log('Registration counts:', regCounts.rows[0]);

  // Check accommodation requested
  const accomCounts = await db.query(`
    SELECT accommodation_requested, COUNT(*)
    FROM raw_participants
    GROUP BY accommodation_requested;
  `);
  console.log('Accommodation requested:', accomCounts.rows);

  // Check unique participants by canonical grouping
  // Let's see: what if duplicates are defined by (name, contingent_id) or (name, college)?
  // Notice: 2,836 raw records.
  // If we group by name + college, there are 364 groups.
  // Wait, let's see how many participants if we keep only unique (name, college) vs duplicate candidates:
  // Wait, what if duplicate candidate is defined by (name, college) where contact or arrival varies?
  // What if duplicate candidate is defined by (name, contact) or phone?

  // Let's check how many unique participants if we resolve duplicates or flag issues:
  // 2,836 total raw rows
  // Step 1: Total records ingested: 2,836
  // Step 2: Records with invalid timeline (arrival > departure): 3
  // Step 3: Records missing critical gender consent/declaration: 417
  // Step 4: Records missing dietary specification: 394
  // Step 5: Duplicate candidates: how many?
  // Let's inspect the data more closely.

  const diffNameSamePhone = await db.query(`
    SELECT contact, COUNT(DISTINCT name)
    FROM raw_participants
    GROUP BY contact
    HAVING COUNT(DISTINCT name) > 1;
  `);
  console.log('Diff name same phone:', diffNameSamePhone.rows.length);

  await db.close();
}

checkWaterfall().catch(console.error);

