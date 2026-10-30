// Role definitions, permission matrix, and field masking matrix for FestOS
// Zero em dashes or en dashes in any UI copy or metadata

export type RoleKey =
  | 'director'
  | 'registration'
  | 'hospitality'
  | 'events'
  | 'logistics'
  | 'merch'
  | 'food'
  | 'volunteer';

export interface RoleDefinition {
  key: RoleKey;
  name: string;
  department: string;
  defaultShift: string;
  badgeColor: string;
  description: string;
}

export const ROLES: Record<RoleKey, RoleDefinition> = {
  director: {
    key: 'director',
    name: 'Festival Director',
    department: 'Directorate',
    defaultShift: '06:00-14:00',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Executive oversight, cross-department alerts, incident command, and approval decisions.'
  },
  registration: {
    key: 'registration',
    name: 'Registration Desk',
    department: 'Registration & Front Desk',
    defaultShift: '22:00-06:00',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Delegate credentialing, NFC check-in, wristband issuance, and duplicate resolution.'
  },
  hospitality: {
    key: 'hospitality',
    name: 'Hospitality',
    department: 'Accommodations & Guest Relations',
    defaultShift: '22:00-06:00',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Hostel room allocations, external hotel overflow, special needs accommodation, and room overrides.'
  },
  events: {
    key: 'events',
    name: 'Events Team',
    department: 'Stage & Competitions',
    defaultShift: '22:00-06:00',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Master schedule, venue status, event delay rescheduling, and clash detection.'
  },
  logistics: {
    key: 'logistics',
    name: 'Logistics Head',
    department: 'Logistics & Infrastructure',
    defaultShift: '14:00-22:00',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Physical inventory, equipment staging, venue gear dispatch, and shortage mitigation.'
  },
  merch: {
    key: 'merch',
    name: 'Merchandise Desk',
    department: 'Merchandise & Swag',
    defaultShift: '06:00-14:00',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'T-shirt and kit issuance, size inventory breakdown, duplicate claim prevention, and exchanges.'
  },
  food: {
    key: 'food',
    name: 'Food Coordinator',
    department: 'Catering & Dining Services',
    defaultShift: '22:00-06:00',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Meal demand forecast, dietary breakdown (veg/jain/vegan), vendor compliance, and covers monitoring.'
  },
  volunteer: {
    key: 'volunteer',
    name: 'Volunteer',
    department: 'Field Operations',
    defaultShift: '10:00-18:00',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'Shift duties, venue attendee headcount checks, task check-off, and ground incident logging.'
  }
};

// Module permission flags: R = Read, W = Write, A = Approve, - = None
export type AccessLevel = 'none' | 'read' | 'write' | 'approve';

export interface ModulePermissions {
  participants: 'RWA' | 'RW_checkin' | 'R' | 'R_limited' | 'none';
  accommodation: 'RWA' | 'R_block_only' | 'RW' | 'none';
  schedule: 'RWA' | 'RW' | 'R' | 'R_meal_times' | 'R_own' | 'none';
  logistics: 'RWA' | 'R_request' | 'RW' | 'none';
  merch: 'RWA' | 'R_status' | 'R' | 'RW' | 'none';
  vendors: 'RWA' | 'R_counts' | 'R_meal_times' | 'RW' | 'none';
  disruptions: 'all' | 'reg_subset' | 'hosp_subset' | 'events_subset' | 'logistics_subset' | 'merch_subset' | 'food_subset' | 'report_only';
  dataHealth: 'RWA' | 'R_own' | 'none';
  approvals: 'decide' | 'request' | 'none';
}

export const PERMISSION_MATRIX: Record<RoleKey, ModulePermissions> = {
  director: {
    participants: 'RWA',
    accommodation: 'RWA',
    schedule: 'RWA',
    logistics: 'RWA',
    merch: 'RWA',
    vendors: 'RWA',
    disruptions: 'all',
    dataHealth: 'RWA',
    approvals: 'decide'
  },
  registration: {
    participants: 'RW_checkin',
    accommodation: 'R_block_only',
    schedule: 'none',
    logistics: 'none',
    merch: 'R_status',
    vendors: 'none',
    disruptions: 'reg_subset', // duplicate record, late contingent, delayed bus
    dataHealth: 'R_own',
    approvals: 'none'
  },
  hospitality: {
    participants: 'R',
    accommodation: 'RW',
    schedule: 'none',
    logistics: 'none',
    merch: 'none',
    vendors: 'R_counts',
    disruptions: 'hosp_subset', // hostel closure, late contingent, delayed bus
    dataHealth: 'R_own',
    approvals: 'request'
  },
  events: {
    participants: 'R_limited',
    accommodation: 'none',
    schedule: 'RW',
    logistics: 'R_request',
    merch: 'none',
    vendors: 'R_meal_times',
    disruptions: 'events_subset', // venue change
    dataHealth: 'R_own',
    approvals: 'none'
  },
  logistics: {
    participants: 'none',
    accommodation: 'none',
    schedule: 'R',
    logistics: 'RW',
    merch: 'R',
    vendors: 'none',
    disruptions: 'logistics_subset', // equipment failure
    dataHealth: 'R_own',
    approvals: 'none'
  },
  merch: {
    participants: 'R_limited',
    accommodation: 'none',
    schedule: 'none',
    logistics: 'none',
    merch: 'RW',
    vendors: 'none',
    disruptions: 'merch_subset', // duplicate merch claim
    dataHealth: 'R_own',
    approvals: 'none'
  },
  food: {
    participants: 'none',
    accommodation: 'none',
    schedule: 'R_meal_times',
    logistics: 'none',
    merch: 'none',
    vendors: 'RW',
    disruptions: 'food_subset', // vendor shutdown
    dataHealth: 'R_own',
    approvals: 'none'
  },
  volunteer: {
    participants: 'none',
    accommodation: 'none',
    schedule: 'R_own',
    logistics: 'none',
    merch: 'none',
    vendors: 'none',
    disruptions: 'report_only', // report incident only
    dataHealth: 'none',
    approvals: 'none'
  }
};

// Masking rules for personal identifiable information (PII)
export function maskContact(phone: string | null | undefined, role: RoleKey): string {
  if (!phone) return 'Not Provided';
  if (role === 'director' || role === 'registration') {
    return phone;
  }
  // Mask phone e.g. +91-9876543210 -> +91-******3210
  const clean = phone.trim();
  if (clean.length <= 4) return '****';
  return clean.slice(0, 4) + '******' + clean.slice(-4);
}

export function maskName(name: string, role: RoleKey): string {
  if (role === 'food' || role === 'logistics') {
    return 'Participant Record';
  }
  return name;
}

