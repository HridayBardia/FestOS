import fs from 'fs';
import path from 'path';
import { db } from './db';
import { parseCSV } from './csv-parser';

interface FileTableMapping {
  file: string;
  table: string;
  columns: string[];
}

const MAPPINGS: FileTableMapping[] = [
  {
    file: 'contingents.csv',
    table: 'raw_contingents',
    columns: ['college', 'contingent_id', 'leader', 'escort', 'strength_declared', 'preferences']
  },
  {
    file: 'core_team.csv',
    table: 'raw_core_team',
    columns: ['member_id', 'name', 'role', 'shift', 'phone']
  },
  {
    file: 'events.csv',
    table: 'raw_events',
    columns: ['event_id', 'event_name', 'type', 'rounds', 'duration_minutes', 'venue_requirements', 'equipment_needs', 'volunteers_needed']
  },
  {
    file: 'external_stays.csv',
    table: 'raw_external_stays',
    columns: ['property_id', 'property_name', 'beds', 'cost_per_bed_per_night', 'distance_km', 'transport_availability']
  },
  {
    file: 'hostels.csv',
    table: 'raw_hostels',
    columns: ['room_id', 'block', 'floor', 'gender', 'capacity', 'accessibility', 'status']
  },
  {
    file: 'inventory_logistics.csv',
    table: 'raw_inventory_logistics',
    columns: ['item_id', 'item', 'quantity', 'location', 'condition']
  },
  {
    file: 'inventory_merch.csv',
    table: 'raw_inventory_merch',
    columns: ['item', 'size', 'quantity', 'reserved_quantity']
  },
  {
    file: 'participants.csv',
    table: 'raw_participants',
    columns: ['participant_id', 'name', 'college', 'contingent_id', 'gender_as_given', 'age', 'contact', 'accessibility_needs', 'dietary_needs', 'arrival_datetime', 'departure_datetime', 'accommodation_requested', 'tshirt_size']
  },
  {
    file: 'registrations.csv',
    table: 'raw_registrations',
    columns: ['participant_id', 'event_id', 'team_id']
  },
  {
    file: 'vendors.csv',
    table: 'raw_vendors',
    columns: ['vendor_id', 'vendor_name', 'menu', 'dietary_options', 'hygiene_certificate_expiry', 'hours', 'capacity', 'payment_terms']
  },
  {
    file: 'venues.csv',
    table: 'raw_venues',
    columns: ['venue_id', 'venue_name', 'capacity', 'availability_windows', 'indoor_outdoor']
  }
];

export async function seedRaw(): Promise<{ allMatched: boolean; results: any[] }> {
  console.log('Seeding raw_* tables from CSV files...');
  const dataDir = path.resolve(process.cwd(), 'data', 'full_dataset');

  const reportResults: any[] = [];
  let allMatched = true;

  for (const m of MAPPINGS) {
    const filePath = path.join(dataDir, m.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseCSV(content);
    const header = parsed[0];
    const dataRows = parsed.slice(1);
    const csvRowCount = dataRows.length;

    // Truncate raw table for idempotency
    await db.query(`DELETE FROM ${m.table};`);

    // Insert in batches of 100
    const batchSize = 100;
    const allCols = ['_row_number', '_source_file', ...m.columns];
    const colListStr = allCols.join(', ');

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const valueClauses: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      for (let r = 0; r < batch.length; r++) {
        const rowNumber = i + r + 1; // 1-based data row number
        const rowVals = batch[r];
        const rowParams: string[] = [];

        rowParams.push(`$${paramIdx++}`);
        params.push(rowNumber);

        rowParams.push(`$${paramIdx++}`);
        params.push(m.file);

        for (let c = 0; c < m.columns.length; c++) {
          rowParams.push(`$${paramIdx++}`);
          const val = rowVals[c] !== undefined ? rowVals[c] : null;
          params.push(val);
        }

        valueClauses.push(`(${rowParams.join(', ')})`);
      }

      const insertSql = `INSERT INTO ${m.table} (${colListStr}) VALUES ${valueClauses.join(', ')};`;
      await db.query(insertSql, params);
    }

    const countRes = await db.query(`SELECT COUNT(*) AS cnt FROM ${m.table};`);
    const dbRowCount = parseInt(countRes.rows[0].cnt, 10);
    const matched = csvRowCount === dbRowCount;

    if (!matched) {
      allMatched = false;
    }

    reportResults.push({
      file: m.file,
      table: m.table,
      rowsInCSV: csvRowCount,
      rowsInDatabase: dbRowCount,
      match: matched ? 'yes' : 'no'
    });
  }

  // Print results table
  console.log('\n--- RAW SEED VERIFICATION TABLE ---');
  console.log('| File | Rows in CSV | Rows in Database | Match (yes/no) |');
  console.log('| :--- | :--- | :--- | :--- |');
  for (const r of reportResults) {
    console.log(`| ${r.file} | ${r.rowsInCSV} | ${r.rowsInDatabase} | ${r.match} |`);
  }
  console.log('-----------------------------------\n');

  if (!allMatched) {
    console.error('ERROR: Mismatch detected between CSV rows and raw database counts!');
  } else {
    console.log('All raw tables seeded and verified matching 100%!');
  }

  return { allMatched, results: reportResults };
}

if (require.main === module) {
  seedRaw()
    .then(async ({ allMatched }) => {
      await db.close();
      if (!allMatched) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('seed:raw failed:', err);
      process.exit(1);
    });
}

