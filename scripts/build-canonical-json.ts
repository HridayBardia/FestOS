import fs from 'fs';
import path from 'path';
import { parseCSV } from './csv-parser';

function main() {
  const datasetDir = path.resolve(process.cwd(), 'data', 'full_dataset');
  const files = [
    'core_team.csv',
    'venues.csv',
    'events.csv',
    'contingents.csv',
    'external_stays.csv',
    'hostels.csv',
    'inventory_logistics.csv',
    'inventory_merch.csv',
    'vendors.csv',
    'participants.csv',
    'registrations.csv'
  ];

  const dataset: Record<string, any[]> = {};

  for (const file of files) {
    const filePath = path.join(datasetDir, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(content);
    if (rows.length === 0) continue;

    const headers = rows[0].map(h => h.trim());
    const records = rows.slice(1).map(row => {
      const record: Record<string, any> = {};
      headers.forEach((h, idx) => {
        record[h] = row[idx] ?? '';
      });
      return record;
    });

    const key = file.replace('.csv', '');
    dataset[key] = records;
  }

  const jsonPath = path.resolve(process.cwd(), 'src', 'lib', 'canonical.json');
  fs.writeFileSync(jsonPath, JSON.stringify(dataset), 'utf8');
  console.log(`Generated ${jsonPath} (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);

  // Remove the oversized canonicalDataset.ts
  const oldTsPath = path.resolve(process.cwd(), 'src', 'lib', 'canonicalDataset.ts');
  if (fs.existsSync(oldTsPath)) {
    fs.unlinkSync(oldTsPath);
    console.log(`Removed ${oldTsPath}`);
  }
}

main();

