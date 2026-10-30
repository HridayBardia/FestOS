import { db } from './db';

async function inspectDuplicates() {
  const dups = await db.query(`
    WITH grouped AS (
      SELECT
        LOWER(TRIM(name)) as norm_name,
        LOWER(TRIM(college)) as norm_college,
        COUNT(*) as cnt,
        ARRAY_AGG(participant_id ORDER BY _row_number) as ids,
        ARRAY_AGG(contact ORDER BY _row_number) as contacts,
        ARRAY_AGG(arrival_datetime ORDER BY _row_number) as arrivals
      FROM raw_participants
      GROUP BY LOWER(TRIM(name)), LOWER(TRIM(college))
      HAVING COUNT(*) > 1
    )
    SELECT * FROM grouped LIMIT 10;
  `);
  console.log('Sample duplicates:', JSON.stringify(dups.rows, null, 2));

  const totalInDupGroups = await db.query(`
    WITH grouped AS (
      SELECT
        LOWER(TRIM(name)) as norm_name,
        LOWER(TRIM(college)) as norm_college,
        COUNT(*) as cnt
      FROM raw_participants
      GROUP BY LOWER(TRIM(name)), LOWER(TRIM(college))
      HAVING COUNT(*) > 1
    )
    SELECT
      COUNT(*) as unique_entities_with_dups,
      SUM(cnt) as total_rows_in_dup_groups,
      SUM(cnt - 1) as excess_duplicate_rows
    FROM grouped;
  `);
  console.log('Total in duplicate groups:', totalInDupGroups.rows[0]);

  // Check ages, arrival/departure validity, gender values, etc.
  const genders = await db.query(`
    SELECT gender_as_given, COUNT(*)
    FROM raw_participants
    GROUP BY gender_as_given;
  `);
  console.log('Genders:', genders.rows);

  const ages = await db.query(`
    SELECT
      COUNT(CASE WHEN CAST(age AS INT) < 16 THEN 1 END) as under_16,
      COUNT(CASE WHEN CAST(age AS INT) > 35 THEN 1 END) as over_35,
      MIN(CAST(age AS INT)) as min_age,
      MAX(CAST(age AS INT)) as max_age
    FROM raw_participants
    WHERE age ~ '^[0-9]+$';
  `);
  console.log('Ages:', ages.rows[0]);

  const dates = await db.query(`
    SELECT
      COUNT(CASE WHEN arrival_datetime > departure_datetime THEN 1 END) as arrival_after_departure
    FROM raw_participants
    WHERE arrival_datetime IS NOT NULL AND departure_datetime IS NOT NULL;
  `);
  console.log('Arrival after departure:', dates.rows[0]);

  await db.close();
}

inspectDuplicates().catch(console.error);

