const fs = require('fs');
let content = fs.readFileSync('src/lib/mockData.ts', 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

// 1. Add EquipmentDamageLog to imports
if (!content.includes('EquipmentDamageLog')) {
  content = content.replace(
    'HostelRoom' + nl + '}',
    'HostelRoom,' + nl + '  EquipmentDamageLog' + nl + '}'
  );
}

// 2. Add logisticsJson import
if (!content.includes('logisticsCanonical.json')) {
  content = content.replace(
    "import canonicalJson from './canonicalAllocations.json';",
    "import canonicalJson from './canonicalAllocations.json';" + nl + "import logisticsJson from './logisticsCanonical.json';"
  );
}

// 3. Replace INITIAL_LOGISTICS block
const logStart = content.indexOf('export const INITIAL_LOGISTICS: InventoryLogistics[] = [');
const logEnd = content.indexOf('export const INITIAL_MERCH:', logStart);

if (logStart !== -1 && logEnd !== -1) {
  const newLogisticsSnippet = `export const INITIAL_LOGISTICS: InventoryLogistics[] = logisticsJson.logistics as unknown as InventoryLogistics[];

export const INITIAL_DAMAGE_LOGS: EquipmentDamageLog[] = logisticsJson.damageLogs as unknown as EquipmentDamageLog[];

`;
  content = content.slice(0, logStart) + newLogisticsSnippet.replace(/\n/g, nl) + content.slice(logEnd);
  fs.writeFileSync('src/lib/mockData.ts', content, 'utf8');
  console.log('src/lib/mockData.ts updated successfully with 72 logistics items and 37 damage logs');
} else {
  console.error('Could not find INITIAL_LOGISTICS block');
}
