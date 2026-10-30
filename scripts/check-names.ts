import { db } from './db';

async function checkNames() {
  const distinctNames = await db.query(`
    SELECT COUNT(DISTINCT LOWER(TRIM(name))) as cnt
    FROM raw_participants;
  `);
  console.log('Distinct names in all participants:', distinctNames.rows[0].cnt);

  const topNames = await db.query(`
    SELECT LOWER(TRIM(name)) as name, COUNT(*) as cnt
    FROM raw_participants
    GROUP BY LOWER(TRIM(name))
    ORDER BY cnt DESC
    LIMIT 20;
  `);
  console.log('Top names:', topNames.rows);

  await db.close();
}

checkNames().catch(console.error);

