import { db } from './db';

async function checkDetails() {
  // Check contingents declared strength vs participant count
  const contMatch = await db.query(`
    SELECT
      c.contingent_id,
      c.college,
      c.strength_declared,
      COUNT(p.participant_id) as actual_participants,
      COUNT(DISTINCT LOWER(TRIM(p.name))) as distinct_names
    FROM raw_contingents c
    LEFT JOIN raw_participants p ON c.contingent_id = p.contingent_id
    GROUP BY c.contingent_id, c.college, c.strength_declared
    ORDER BY c.contingent_id;
  `);
  console.log('Sample contingent declared strength vs participant counts:');
  for (const r of contMatch.rows.slice(0, 10)) {
    console.log(`  ${r.contingent_id}: declared=${r.strength_declared}, total_rows=${r.actual_participants}, distinct_names=${r.distinct_names}`);
  }

  // Check sum of declared strength across all 38 contingents
  const sumDeclared = await db.query(`
    SELECT SUM(CAST(strength_declared AS INT)) as total_declared
    FROM raw_contingents
    WHERE strength_declared ~ '^[0-9]+$';
  `);
  console.log('Total declared strength across contingents:', sumDeclared.rows[0].total_declared);

  // Check how many unique (name, college) or unique (name, contingent_id)
  const uniqueNameCont = await db.query(`
    SELECT COUNT(DISTINCT (LOWER(TRIM(name)), contingent_id)) as unique_name_contingent
    FROM raw_participants;
  `);
  console.log('Unique (name, contingent_id):', uniqueNameCont.rows[0].unique_name_contingent);

  // Check registrations
  const regDups = await db.query(`
    SELECT participant_id, event_id, COUNT(*)
    FROM raw_registrations
    GROUP BY participant_id, event_id
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate (participant_id, event_id) in registrations:', regDups.rows.length);

  await db.close();
}

checkDetails().catch(console.error);

