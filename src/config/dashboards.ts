// Dashboard configuration: ordered widget IDs and metadata per role
// Zero em dashes or en dashes in any UI copy or metadata

import { RoleKey } from './roles';

export interface WidgetMeta {
  id: string;
  title: string;
  description: string;
  category: 'metric' | 'action' | 'matrix' | 'feed' | 'tool';
  gridSpan: 'full' | 'half' | 'third';
  refreshIntervalSeconds: number;
}

export const ROLE_DASHBOARDS: Record<RoleKey, string[]> = {
  registration: [
    'checkin_counter',
    'checkin_queue',
    'duplicate_resolution',
    'wristband_issuance',
    'late_arrivals',
    'quick_actions'
  ],
  hospitality: [
    'bed_occupancy_matrix',
    'external_stay_tracker',
    'contingent_rooming',
    'checkin_pipeline',
    'special_needs_queue',
    'room_override_form',
    'approval_requests'
  ],
  events: [
    'schedule_timeline',
    'venue_status_board',
    'clash_alert_feed',
    'judge_roster',
    'event_delay_tool',
    'volunteer_deployment'
  ],
  logistics: [
    'inventory_status',
    'equipment_by_venue',
    'shortages_and_clashes',
    'move_request_queue',
    'damage_report_form'
  ],
  merch: [
    'stock_by_size',
    'issuance_station',
    'duplicate_claim_detector',
    'size_exchange_tool',
    'contingent_bulk_pickup'
  ],
  food: [
    'meal_headcount_forecast',
    'dietary_breakdown',
    'vendor_capacity_tracker',
    'meal_slot_monitor',
    'incident_logger'
  ],
  volunteer: [
    'my_shift',
    'my_tasks',
    'venue_headcount_report',
    'report_incident',
    'meal_pass'
  ],
  director: [
    'master_kpi_bar',
    'live_incident_command',
    'pending_approvals',
    'cross_department_alerts',
    'director_alerts_drilldown',
    'festival_timeline_health'
  ]
};

export const WIDGET_REGISTRY_META: Record<string, WidgetMeta> = {
  // Registration Widgets
  checkin_counter: {
    id: 'checkin_counter',
    title: 'Check-In Telemetry & Progress',
    description: 'Checked-in vs expected delegates with percentage and contingent distribution.',
    category: 'metric',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  checkin_queue: {
    id: 'checkin_queue',
    title: 'Fast Check-In Queue',
    description: 'Instant lookup by ID or name with 1-click check-in and duplicate warnings.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  duplicate_resolution: {
    id: 'duplicate_resolution',
    title: 'Duplicate Candidate Resolver',
    description: 'Side-by-side inspection to pick canonical record and merge registrations.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  wristband_issuance: {
    id: 'wristband_issuance',
    title: 'NFC Wristband Credentialing',
    description: 'Link physical security wristband serial number to participant ID.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  late_arrivals: {
    id: 'late_arrivals',
    title: 'Late Arrival Contingents',
    description: 'Expected contingents whose arrival timestamp has lapsed without check-in.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  quick_actions: {
    id: 'quick_actions',
    title: 'Desk Quick Actions & Walk-Ins',
    description: 'Register emergency walk-in (creates approval) or flag security concerns.',
    category: 'action',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },

  // Hospitality Widgets
  bed_occupancy_matrix: {
    id: 'bed_occupancy_matrix',
    title: 'Hostel Bed Occupancy Grid',
    description: 'Block by floor breakdown of campus beds occupied, vacant, or blocked.',
    category: 'matrix',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  external_stay_tracker: {
    id: 'external_stay_tracker',
    title: 'External Hotel Overflow Tracker',
    description: 'Hotel placements, distance, shuttle availability, and procurement cost.',
    category: 'metric',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  contingent_rooming: {
    id: 'contingent_rooming',
    title: 'Contingent Rooming Clusters',
    description: 'College-wise room allocation lists ensuring contingent cohesion.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  checkin_pipeline: {
    id: 'checkin_pipeline',
    title: 'Incoming Contingents Pipeline',
    description: 'Upcoming arrivals in next 4 hours and room readiness confirmation.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  special_needs_queue: {
    id: 'special_needs_queue',
    title: 'Accessibility & Needs Queue',
    description: 'Ground floor and elevator verification for mobility and dietary needs.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  room_override_form: {
    id: 'room_override_form',
    title: 'Room Allocation Override Tool',
    description: 'Reallocate participant with mandatory operational justification.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  approval_requests: {
    id: 'approval_requests',
    title: 'Director Approval Dispatch',
    description: 'Request emergency overflow bed releases or capacity overrides.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },

  // Events Widgets
  schedule_timeline: {
    id: 'schedule_timeline',
    title: 'Event Schedule Timeline',
    description: 'Chronological timeline of festival events with active status.',
    category: 'matrix',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  venue_status_board: {
    id: 'venue_status_board',
    title: 'Venue Operational Board',
    description: 'Live occupancy, current activity, and equipment state across all 9 venues.',
    category: 'matrix',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  clash_alert_feed: {
    id: 'clash_alert_feed',
    title: 'Schedule Clash Detector',
    description: 'Live detection of participant schedule overlaps and venue double-bookings.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  judge_roster: {
    id: 'judge_roster',
    title: 'Judge Assignments Roster',
    description: 'Roster status (No judge roster in CSV; clash engine inactive per ASM-002).',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  event_delay_tool: {
    id: 'event_delay_tool',
    title: 'Event Reschedule & Delay Tool',
    description: 'Adjust event timings with preview of downstream cascade clashes.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  volunteer_deployment: {
    id: 'volunteer_deployment',
    title: 'Volunteer Event Deployment',
    description: 'Assigned volunteer leads vs required personnel per competition.',
    category: 'metric',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },

  // Logistics Widgets
  inventory_status: {
    id: 'inventory_status',
    title: 'Logistics Inventory Telemetry',
    description: '72 items on hand, staged, available, and physical condition checks.',
    category: 'metric',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  equipment_by_venue: {
    id: 'equipment_by_venue',
    title: 'Equipment Deployed by Venue',
    description: 'Sound, lighting, and power gear matched against event requirements.',
    category: 'matrix',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  shortages_and_clashes: {
    id: 'shortages_and_clashes',
    title: 'Equipment Shortage Alerts',
    description: 'Simultaneous demands exceeding warehouse stock and zero-balance alerts.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  move_request_queue: {
    id: 'move_request_queue',
    title: 'Gear Dispatch Requests',
    description: 'Inter-departmental requests from Events and Stage coordinators.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  damage_report_form: {
    id: 'damage_report_form',
    title: 'Damage & Condition Logger',
    description: 'Flag faulty equipment, decrement operational inventory, and log audit.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },

  // Merchandise Widgets
  stock_by_size: {
    id: 'stock_by_size',
    title: 'Merchandise Inventory by Size',
    description: 'Festival hoodies and kits breakdown across XS, S, M, L, XL, XXL.',
    category: 'matrix',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  issuance_station: {
    id: 'issuance_station',
    title: 'Merch Issuance Station',
    description: 'Lookup delegate, verify eligibility, select size, and issue kit.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  duplicate_claim_detector: {
    id: 'duplicate_claim_detector',
    title: 'Duplicate Claim Alerts',
    description: 'Security alerts when a participant attempts a second merchandise claim.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  size_exchange_tool: {
    id: 'size_exchange_tool',
    title: 'Size Exchange Console',
    description: 'Process size swaps with stock updates and mandatory exchange reason.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  contingent_bulk_pickup: {
    id: 'contingent_bulk_pickup',
    title: 'Contingent Bulk Kit Pickup',
    description: 'Batch issue merchandise kits to college leader with confirmation receipt.',
    category: 'action',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },

  // Food Widgets
  meal_headcount_forecast: {
    id: 'meal_headcount_forecast',
    title: 'Meal Demand Forecast (24h)',
    description: 'Breakfast, lunch, and dinner headcount based on checked-in delegates.',
    category: 'metric',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  dietary_breakdown: {
    id: 'dietary_breakdown',
    title: 'Dietary Preferences Breakdown',
    description: 'Pure Vegetarian, Jain, Vegan, and allergy requirements distribution.',
    category: 'matrix',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  vendor_capacity_tracker: {
    id: 'vendor_capacity_tracker',
    title: 'Vendor Compliance & Capacity',
    description: '14 caterers capacity, meal slot covers, and sanitary certificate validity.',
    category: 'matrix',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  meal_slot_monitor: {
    id: 'meal_slot_monitor',
    title: 'Live Dining Service Monitor',
    description: 'Current dining window scanner throughput vs forecasted covers.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  incident_logger: {
    id: 'incident_logger',
    title: 'Food Safety Incident Reporter',
    description: 'Report catering contamination, supply shortages, or vendor suspensions.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },

  // Volunteer Widgets
  my_shift: {
    id: 'my_shift',
    title: 'Assigned Shift & Duty Post',
    description: 'Current shift timing, venue post, supervisor contact, and emergency lead.',
    category: 'metric',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  my_tasks: {
    id: 'my_tasks',
    title: 'Shift Task Checklist',
    description: 'Action items for assigned event coordination with 1-click completion.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  venue_headcount_report: {
    id: 'venue_headcount_report',
    title: 'Venue Headcount Submitter',
    description: 'Submit observed auditorium crowd levels to prevent capacity breaches.',
    category: 'tool',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  report_incident: {
    id: 'report_incident',
    title: 'Ground Incident Reporter',
    description: 'Fast incident logger for spills, medical needs, gear issues, or crowds.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  meal_pass: {
    id: 'meal_pass',
    title: 'Volunteer Meal Pass',
    description: 'Duty crew dining clearance pass linked to shift timing.',
    category: 'metric',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },

  // Director Widgets
  master_kpi_bar: {
    id: 'master_kpi_bar',
    title: 'Festival Operations Command Telemetry',
    description: 'Total delegates on campus, checked in, bed occupancy %, and budget spend.',
    category: 'metric',
    gridSpan: 'full',
    refreshIntervalSeconds: 20
  },
  live_incident_command: {
    id: 'live_incident_command',
    title: 'Live Incident Command Center',
    description: 'All open incidents across festival grounds with severity escalation.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  pending_approvals: {
    id: 'pending_approvals',
    title: 'Pending Director Approvals',
    description: 'Executive authorization requests with 1-click approve/reject and mandatory audit reason.',
    category: 'action',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  cross_department_alerts: {
    id: 'cross_department_alerts',
    title: 'Cross-Department Alerts Feed',
    description: 'Routing bus alerts categorized by department with downstream impact metrics.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  director_alerts_drilldown: {
    id: 'director_alerts_drilldown',
    title: 'Director Alerts Drilldown',
    description: 'Detailed inspection of open cross-department alerts, priority escalations, and system health.',
    category: 'feed',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  },
  festival_timeline_health: {
    id: 'festival_timeline_health',
    title: 'Festival Milestone Readiness',
    description: 'Countdown and operational health scores for key festival milestones.',
    category: 'metric',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  }
};

