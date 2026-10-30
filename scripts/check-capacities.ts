import { db } from './db';

async function checkCapacities() {
  const hostelCap = await db.query(`
    SELECT
      gender,
      COUNT(room_id) as room_count,
      SUM(capacity) as total_beds
    FROM hostel_rooms
    GROUP BY gender;
  `);
  console.log('Hostel capacity by gender:', hostelCap.rows);

  const extCap = await db.query(`
    SELECT
      property_id,
      property_name,
      beds,
      cost_per_bed_per_night,
      distance_km
    FROM external_stays;
  `);
  console.log('External stays capacity:', extCap.rows);

  const totalExtBeds = await db.query(`SELECT SUM(beds) as total_beds FROM external_stays;`);
  console.log('Total external beds:', totalExtBeds.rows[0].total_beds);

  const accomByGender = await db.query(`
    SELECT
      gender_as_given,
      COUNT(*) as count
    FROM participants
    WHERE accommodation_requested = TRUE
    GROUP BY gender_as_given;
  `);
  console.log('Accommodation demand by gender_as_given:', accomByGender.rows);

  await db.close();
}

checkCapacities().catch(console.error);

