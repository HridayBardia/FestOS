import { db } from './db';

async function analyze() {
  const pCount = await db.query('SELECT COUNT(*) FROM raw_participants');
  console.log('Total raw_participants:', pCount.rows[0].count);

  // Check blanks in raw_participants
  const blanks = await db.query(`
    SELECT
      COUNT(CASE WHEN participant_id IS NULL OR participant_id = '' THEN 1 END) as blank_id,
      COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as blank_name,
      COUNT(CASE WHEN college IS NULL OR college = '' THEN 1 END) as blank_college,
      COUNT(CASE WHEN contingent_id IS NULL OR contingent_id = '' THEN 1 END) as blank_contingent,
      COUNT(CASE WHEN gender_as_given IS NULL OR gender_as_given = '' THEN 1 END) as blank_gender,
      COUNT(CASE WHEN age IS NULL OR age = '' THEN 1 END) as blank_age,
      COUNT(CASE WHEN contact IS NULL OR contact = '' THEN 1 END) as blank_contact,
      COUNT(CASE WHEN arrival_datetime IS NULL OR arrival_datetime = '' THEN 1 END) as blank_arrival,
      COUNT(CASE WHEN departure_datetime IS NULL OR departure_datetime = '' THEN 1 END) as blank_departure,
      COUNT(CASE WHEN accommodation_requested IS NULL OR accommodation_requested = '' THEN 1 END) as blank_accom,
      COUNT(CASE WHEN dietary_needs IS NULL OR dietary_needs = '' THEN 1 END) as blank_diet,
      COUNT(CASE WHEN accessibility_needs IS NULL OR accessibility_needs = '' THEN 1 END) as blank_access
    FROM raw_participants;
  `);
  console.log('Blanks in raw_participants:', blanks.rows[0]);

  // Check duplicate IDs, duplicate contacts, duplicate name+college
  const dupId = await db.query(`
    SELECT participant_id, COUNT(*)
    FROM raw_participants
    GROUP BY participant_id
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate participant_ids:', dupId.rows.length);

  const dupContact = await db.query(`
    SELECT contact, COUNT(*)
    FROM raw_participants
    WHERE contact IS NOT NULL AND contact != ''
    GROUP BY contact
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate contacts:', dupContact.rows.length);

  const dupNameCollege = await db.query(`
    SELECT LOWER(TRIM(name)) as n, LOWER(TRIM(college)) as c, COUNT(*)
    FROM raw_participants
    GROUP BY LOWER(TRIM(name)), LOWER(TRIM(college))
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate name + college:', dupNameCollege.rows.length);

  // Check invalid foreign keys
  const invalidContingent = await db.query(`
    SELECT COUNT(*)
    FROM raw_participants p
    LEFT JOIN raw_contingents c ON p.contingent_id = c.contingent_id
    WHERE c.contingent_id IS NULL AND p.contingent_id IS NOT NULL AND p.contingent_id != '';
  `);
  console.log('Invalid contingent_id in participants:', invalidContingent.rows[0].count);

  const invalidRegParticipant = await db.query(`
    SELECT COUNT(*)
    FROM raw_registrations r
    LEFT JOIN raw_participants p ON r.participant_id = p.participant_id
    WHERE p.participant_id IS NULL;
  `);
  console.log('Invalid participant_id in registrations:', invalidRegParticipant.rows[0].count);

  const invalidRegEvent = await db.query(`
    SELECT COUNT(*)
    FROM raw_registrations r
    LEFT JOIN raw_events e ON r.event_id = e.event_id
    WHERE e.event_id IS NULL;
  `);
  console.log('Invalid event_id in registrations:', invalidRegEvent.rows[0].count);

  await db.close();
}

analyze().catch(console.error);

