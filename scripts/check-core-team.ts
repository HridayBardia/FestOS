import { db } from './db';

async function checkCoreTeam() {
  const roles = await db.query(`
    SELECT role, COUNT(*), ARRAY_AGG(member_id) as members, ARRAY_AGG(shift) as shifts
    FROM raw_core_team
    GROUP BY role;
  `);
  console.log('Core team roles:');
  for (const r of roles.rows) {
    console.log(`- Role: "${r.role}", count: ${r.count}, members: ${r.members.slice(0, 3).join(', ')}, shifts: ${r.shifts.slice(0, 3).join(', ')}`);
  }

  const shifts = await db.query(`
    SELECT shift, COUNT(*)
    FROM raw_core_team
    GROUP BY shift;
  `);
  console.log('\nCore team shifts:');
  for (const s of shifts.rows) {
    console.log(`- Shift: "${s.shift}", count: ${s.count}`);
  }

  await db.close();
}

checkCoreTeam().catch(console.error);

