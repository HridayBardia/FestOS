import fs from 'fs';
import path from 'path';

export function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (c === '\r') {
        if (i + 1 < content.length && content[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        currentVal = '';
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (c === '\n') {
        currentRow.push(currentVal.trim());
        currentVal = '';
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentVal += c;
      }
    }
    i++;
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

if (require.main === module) {
  const dataDir = path.join(process.cwd(), 'data', 'full_dataset');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  console.log('Testing parseCSV on files in', dataDir);
  for (const f of files) {
    const content = fs.readFileSync(path.join(dataDir, f), 'utf-8');
    const parsed = parseCSV(content);
    console.log(`${f.padEnd(25)}: total=${parsed.length}, header cols=${parsed[0].length}, data rows=${parsed.length - 1}`);
  }
}

