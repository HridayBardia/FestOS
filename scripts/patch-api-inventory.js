const fs = require('fs');

// 1. inMemoryDb.ts: remove slice(0, 50)
let inMem = fs.readFileSync('src/lib/inMemoryDb.ts', 'utf8');
inMem = inMem.replace(
  'return { rows: rows.slice(0, 50), rowCount: rows.length };',
  'return { rows: rows, rowCount: rows.length };'
);
fs.writeFileSync('src/lib/inMemoryDb.ts', inMem, 'utf8');
console.log('inMemoryDb.ts updated');

// 2. route.ts: remove LIMIT 30 from inventory_status
let route = fs.readFileSync('src/app/api/widgets/data/route.ts', 'utf8');
route = route.replace(
  'ORDER BY quantity DESC\n          LIMIT 30;',
  'ORDER BY item_id ASC;'
);
route = route.replace(
  'ORDER BY quantity DESC\r\n          LIMIT 30;',
  'ORDER BY item_id ASC;'
);
fs.writeFileSync('src/app/api/widgets/data/route.ts', route, 'utf8');
console.log('route.ts updated');
