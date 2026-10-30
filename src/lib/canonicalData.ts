// Lazy JSON-backed canonical dataset provider for FestOS
// Zero static worker memory overhead during Next.js build
// Zero em dashes or en dashes

import fs from 'fs';
import path from 'path';

export interface CanonicalDataset {
  core_team: any[];
  venues: any[];
  events: any[];
  contingents: any[];
  external_stays: any[];
  hostels: any[];
  inventory_logistics: any[];
  inventory_merch: any[];
  vendors: any[];
  participants: any[];
  registrations: any[];
}

let cachedDataset: CanonicalDataset | null = null;

export function getCanonicalDataset(): CanonicalDataset {
  if (cachedDataset) return cachedDataset;

  const candidatePaths = [
    path.resolve(process.cwd(), 'src', 'lib', 'canonical.json'),
    path.resolve(process.cwd(), '.next', 'server', 'canonical.json'),
    path.join(__dirname, 'canonical.json'),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        cachedDataset = JSON.parse(raw);
        return cachedDataset!;
      }
    } catch {
      // Continue searching
    }
  }

  // Safe fallback if JSON file is missing
  return {
    core_team: [],
    venues: [],
    events: [],
    contingents: [],
    external_stays: [],
    hostels: [],
    inventory_logistics: [],
    inventory_merch: [],
    vendors: [],
    participants: [],
    registrations: []
  };
}

export const CANONICAL_DATASET: CanonicalDataset = new Proxy({} as CanonicalDataset, {
  get(_target, prop: string) {
    const ds = getCanonicalDataset();
    return (ds as any)[prop] || [];
  }
});
