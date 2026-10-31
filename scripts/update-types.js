const fs = require('fs');
let types = fs.readFileSync('src/types/database.ts', 'utf8');
const isCrlf = types.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

const oldLogistics = `export interface InventoryLogistics {
  id: string;
  item_name: string;
  category: 'av_equipment' | 'furniture' | 'barricades' | 'power_generators' | 'canopy';
  total_quantity: number;
  in_use_quantity: number;
  available_quantity: number;
  location: string;
  condition: 'optimal' | 'needs_repair' | 'damaged';
}`;

const newLogistics = `export interface InventoryLogistics {
  id: string;
  item_id?: string;
  item_name: string;
  item?: string;
  category: string;
  total_quantity: number;
  quantity?: number;
  in_use_quantity: number;
  available_quantity: number;
  location: string;
  condition: string;
}

export interface EquipmentDamageLog {
  id: string;
  itemId: string;
  itemName: string;
  quantityAffected: number;
  depotLocation: string;
  severity: 'critical' | 'high' | 'medium';
  reportedCondition: 'under repair' | 'needs check' | 'damaged' | 'decommissioned';
  defectDescription: string;
  loggedBy: string;
  loggedRole: string;
  timestamp: string;
  alertCode?: string;
  repairStatus: 'investigating' | 'under_repair' | 'parts_ordered' | 'repaired';
  resolvedAt?: string;
  resolutionNotes?: string;
}`;

types = types.replace(oldLogistics.replace(/\n/g, nl), newLogistics.replace(/\n/g, nl));
fs.writeFileSync('src/types/database.ts', types, 'utf8');
console.log('src/types/database.ts updated successfully');
