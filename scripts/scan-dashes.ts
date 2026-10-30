import fs from 'fs';
import path from 'path';

function scanDir(dir: string, found: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath, found);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.mjs'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/[\u2013\u2014]/.test(content)) {
        found.push(fullPath);
      }
    }
  }
}

const found: string[] = [];
scanDir(path.resolve('src'), found);
scanDir(path.resolve('scripts'), found);
console.log('Files with em/en dash:', found.length);
if (found.length > 0) {
  console.log(found);
}

