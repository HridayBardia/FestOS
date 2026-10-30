import { db } from './db';

async function main() {
  const r = await db.query('SELECT 1 + 1 AS test');
  console.log('Test result:', r.rows);
  await db.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

