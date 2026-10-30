import { db } from './db';

async function checkIssues() {
  // Check timeline issues
  const timelineIssues = await db.query(`
    SELECT participant_id, name, college, arrival_datetime, departure_datetime
    FROM raw_participants
    WHERE arrival_datetime > departure_datetime;
  `);
  console.log('Timeline invalid rows (arrival > departure):', timelineIssues.rows);

  // Check age issues
  const ageIssues = await db.query(`
    SELECT participant_id, name, age
    FROM raw_participants
    WHERE CAST(age AS INT) < 18;
  `);
  console.log('Age < 18:', ageIssues.rows.length);

  // Check accommodation requested vs gender blank
  const accomAndGenderBlank = await db.query(`
    SELECT
      COUNT(CASE WHEN accommodation_requested = 'yes' AND (gender_as_given IS NULL OR gender_as_given = '') THEN 1 END) as accom_yes_gender_blank,
      COUNT(CASE WHEN accommodation_requested = 'no' AND (gender_as_given IS NULL OR gender_as_given = '') THEN 1 END) as accom_no_gender_blank
    FROM raw_participants;
  `);
  console.log('Accommodation requested vs gender blank:', accomAndGenderBlank.rows[0]);

  // Check duplicate candidate definitions:
  // e.g. same name, same college, same event registrations?
  const sameNameCollegeEvents = await db.query(`
    WITH p_events AS (
      SELECT
        p.participant_id,
        LOWER(TRIM(p.name)) as name,
        p.college,
        p.contingent_id,
        p.contact,
        ARRAY_AGG(r.event_id ORDER BY r.event_id) as events
      FROM raw_participants p
      JOIN raw_registrations r ON p.participant_id = r.participant_id
      GROUP BY p.participant_id, LOWER(TRIM(p.name)), p.college, p.contingent_id, p.contact
    )
    SELECT
      e1.participant_id as p1,
      e2.participant_id as p2,
      e1.name,
      e1.college,
      e1.events
    FROM p_events e1
    JOIN p_events e2 ON e1.name = e2.name AND e1.college = e2.college AND e1.participant_id < e2.participant_id AND e1.events = e2.events;
  `);
  console.log('Participants with identical (name, college, exact same events):', sameNameCollegeEvents.rows.length);

  // Check vendors hygiene expiry issues
  const vendorHygiene = await db.query(`
    SELECT vendor_id, vendor_name, hygiene_certificate_expiry
    FROM raw_vendors;
  `);
  console.log('Vendors hygiene:', vendorHygiene.rows);

  await db.close();
}

checkIssues().catch(console.error);

