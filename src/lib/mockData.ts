import {
  Contingent,
  Participant,
  Hostel,
  ExternalStay,
  AccommodationAllocation,
  Venue,
  EventItem,
  Registration,
  Vendor,
  InventoryLogistics,
  InventoryMerch,
  CoreTeamMember,
  OverrideAuditLog
} from '../types/database';
import canonicalJson from './canonicalAllocations.json';

export const INITIAL_CONTINGENTS: Contingent[] = canonicalJson.contingents as unknown as Contingent[];

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel-01',
    name: 'IPM Residence 1',
    code: 'IPM-H1',
    gender_allowed: 'female',
    total_capacity: 120,
    occupied_beds: 74,
    status: 'operational',
    floor_count: 3,
    has_elevator: true,
    notes: 'Ground floor priority for accessibility needs. Ramp access available.'
  },
  {
    id: 'hostel-02',
    name: 'IPM Residence 2',
    code: 'IPM-H2',
    gender_allowed: 'male',
    total_capacity: 150,
    occupied_beds: 96,
    status: 'operational',
    floor_count: 4,
    has_elevator: true,
    notes: 'Wing B renovated recently. 24/7 solar hot water.'
  },
  {
    id: 'hostel-03',
    name: 'PGP Block Alpha',
    code: 'PGP-BA',
    gender_allowed: 'male',
    total_capacity: 180,
    occupied_beds: 122,
    status: 'operational',
    floor_count: 3,
    has_elevator: false,
    notes: 'Standard double occupancy rooms.'
  },
  {
    id: 'hostel-04',
    name: 'PGP Block Beta',
    code: 'PGP-BB',
    gender_allowed: 'female',
    total_capacity: 140,
    occupied_beds: 68,
    status: 'operational',
    floor_count: 3,
    has_elevator: false,
    notes: 'Quiet study zone on 3rd floor.'
  },
  {
    id: 'hostel-05',
    name: 'MDP Executive Residence',
    code: 'MDP-RES',
    gender_allowed: 'all',
    total_capacity: 60,
    occupied_beds: 42,
    status: 'operational',
    floor_count: 2,
    has_elevator: true,
    notes: 'Premium air-conditioned suites reserved for VIPs, judges, and accessibility overflow.'
  }
];

export const INITIAL_EXTERNAL_STAYS: ExternalStay[] = [
  {
    id: 'ext-01',
    name: 'Crescent Spa & Resort (Overflow Stay 1)',
    location: 'Rau Bypass Road, Indore (5 km from Campus)',
    total_capacity: 100,
    occupied_beds: 18,
    cost_per_night: 2200,
    contact_person: 'Vikram Joshi (GM)',
    contact_phone: '+91 94250 88990',
    status: 'active'
  },
  {
    id: 'ext-02',
    name: 'Radisson Blu Indore (VIP / Judges Overflow)',
    location: 'MR 10 Road, Vijay Nagar, Indore',
    total_capacity: 40,
    occupied_beds: 12,
    cost_per_night: 4800,
    contact_person: 'Sunita Rao',
    contact_phone: '+91 97551 23411',
    status: 'active'
  },
  {
    id: 'ext-03',
    name: 'Papaya Tree Hotel (Contingent Overflow)',
    location: 'A.B. Road, Rau Circle, Indore',
    total_capacity: 80,
    occupied_beds: 0,
    cost_per_night: 1800,
    contact_person: 'Harish Patel',
    contact_phone: '+91 98260 77123',
    status: 'standby'
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = canonicalJson.participants as unknown as Participant[];

export const INITIAL_ALLOCATIONS: AccommodationAllocation[] = canonicalJson.allocations as unknown as AccommodationAllocation[];

export const INITIAL_VENUES: Venue[] = [
  { id: 'V01', name: 'Main Stage', code: 'V01', capacity: 60, type: 'auditorium', has_projector: false, has_sound_system: true, has_ac: true, status: 'available' },
  { id: 'V02', name: 'LT-1', code: 'V02', capacity: 150, type: 'classroom', has_projector: true, has_sound_system: true, has_ac: true, status: 'available' },
  { id: 'V03', name: 'LT-2', code: 'V03', capacity: 150, type: 'classroom', has_projector: true, has_sound_system: true, has_ac: true, status: 'available' },
  { id: 'V04', name: 'Amphitheatre', code: 'V04', capacity: 250, type: 'amphitheatre', has_projector: true, has_sound_system: true, has_ac: false, status: 'available' },
  { id: 'V05', name: 'Quadrangle', code: 'V05', capacity: 100, type: 'ground', has_projector: false, has_sound_system: true, has_ac: false, status: 'available' },
  { id: 'V06', name: 'Hostel Lawn', code: 'V06', capacity: 100, type: 'ground', has_projector: false, has_sound_system: true, has_ac: false, status: 'available' },
  { id: 'V07', name: 'Seminar Hall', code: 'V07', capacity: 60, type: 'auditorium', has_projector: true, has_sound_system: true, has_ac: true, status: 'available' },
  { id: 'V08', name: 'Sports Complex', code: 'V08', capacity: 100, type: 'ground', has_projector: false, has_sound_system: true, has_ac: true, status: 'available' },
  { id: 'V09', name: 'Library Hall', code: 'V09', capacity: 60, type: 'auditorium', has_projector: true, has_sound_system: true, has_ac: true, status: 'available' }
];

export const INITIAL_EVENTS: EventItem[] = [
  { id: 'E01', title: 'Aarohan', category: 'solo', venue_id: 'V01', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T10:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E02', title: 'Pitch Perfect', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T09:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E03', title: 'Case Clash', category: 'team', venue_id: 'V04', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T11:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 250, status: 'scheduled' },
  { id: 'E04', title: 'Biz Quiz', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T10:00:00.000Z', end_time: '2026-10-30T12:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E05', title: 'Battle of Bands', category: 'solo', venue_id: 'V03', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T11:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E06', title: 'Street Play', category: 'team', venue_id: 'V05', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T09:45:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 100, status: 'scheduled' },
  { id: 'E07', title: 'Nukkad Natak', category: 'solo', venue_id: 'V06', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T09:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 100, status: 'scheduled' },
  { id: 'E08', title: 'Treasure Hunt', category: 'solo', venue_id: 'V07', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T09:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E09', title: 'Code Relay', category: 'team', venue_id: 'V08', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T11:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 100, status: 'scheduled' },
  { id: 'E10', title: 'Design Sprint', category: 'solo', venue_id: 'V09', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T09:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E11', title: 'Debate', category: 'solo', venue_id: 'V03', start_time: '2026-10-30T11:30:00.000Z', end_time: '2026-10-30T12:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E12', title: 'MUN', category: 'team', venue_id: 'V05', start_time: '2026-10-30T10:15:00.000Z', end_time: '2026-10-30T12:15:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 100, status: 'scheduled' },
  { id: 'E13', title: 'Poetry Slam', category: 'solo', venue_id: 'V06', start_time: '2026-10-30T10:15:00.000Z', end_time: '2026-10-30T12:15:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 100, status: 'scheduled' },
  { id: 'E14', title: 'Stand-up', category: 'solo', venue_id: 'V07', start_time: '2026-10-30T10:15:00.000Z', end_time: '2026-10-30T12:15:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E15', title: 'Photography Walk', category: 'team', venue_id: 'V08', start_time: '2026-10-30T11:30:00.000Z', end_time: '2026-10-30T13:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 100, status: 'scheduled' },
  { id: 'E16', title: 'Short Film', category: 'solo', venue_id: 'V09', start_time: '2026-10-30T10:15:00.000Z', end_time: '2026-10-30T11:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E17', title: 'Ad-Mad', category: 'solo', venue_id: 'V01', start_time: '2026-10-30T11:00:00.000Z', end_time: '2026-10-30T13:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E18', title: 'Stock Wars', category: 'team', venue_id: 'V04', start_time: '2026-10-30T11:30:00.000Z', end_time: '2026-10-30T13:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 250, status: 'scheduled' },
  { id: 'E19', title: 'IPL Auction', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T12:30:00.000Z', end_time: '2026-10-30T13:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E20', title: 'Dance Face-off', category: 'solo', venue_id: 'V05', start_time: '2026-10-30T12:45:00.000Z', end_time: '2026-10-30T13:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 100, status: 'scheduled' },
  { id: 'E21', title: 'Fashion Show', category: 'team', venue_id: 'V01', start_time: '2026-10-30T13:30:00.000Z', end_time: '2026-10-30T14:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 60, status: 'scheduled' },
  { id: 'E22', title: 'Open Mic', category: 'solo', venue_id: 'V06', start_time: '2026-10-30T12:45:00.000Z', end_time: '2026-10-30T14:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 100, status: 'scheduled' },
  { id: 'E23', title: 'Chess', category: 'solo', venue_id: 'V07', start_time: '2026-10-30T12:45:00.000Z', end_time: '2026-10-30T14:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E24', title: 'Futsal', category: 'team', venue_id: 'V08', start_time: '2026-10-30T14:00:00.000Z', end_time: '2026-10-30T15:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 100, status: 'scheduled' },
  { id: 'E25', title: 'Basketball', category: 'solo', venue_id: 'V08', start_time: '2026-10-30T16:00:00.000Z', end_time: '2026-10-30T17:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 100, status: 'scheduled' },
  { id: 'E26', title: 'Badminton', category: 'solo', venue_id: 'V09', start_time: '2026-10-30T12:15:00.000Z', end_time: '2026-10-30T14:15:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 60, status: 'scheduled' },
  { id: 'E27', title: 'Table Tennis', category: 'team', venue_id: 'V09', start_time: '2026-10-30T14:45:00.000Z', end_time: '2026-10-30T16:45:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 60, status: 'scheduled' },
  { id: 'E28', title: 'Robo Race', category: 'solo', venue_id: 'V04', start_time: '2026-10-30T13:30:00.000Z', end_time: '2026-10-30T15:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 250, status: 'scheduled' },
  { id: 'E29', title: 'Treasure Trivia', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T14:00:00.000Z', end_time: '2026-10-30T14:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled' },
  { id: 'E30', title: 'Startup Showcase', category: 'team', venue_id: 'V04', start_time: '2026-10-30T16:00:00.000Z', end_time: '2026-10-30T18:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 250, status: 'scheduled' },
  { id: 'E31', title: 'Grand Finale', category: 'solo', venue_id: 'V04', start_time: '2026-10-31T18:00:00.000Z', end_time: '2026-10-31T20:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 250, status: 'scheduled' }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-01',
    event_id: 'evt-01',
    contingent_id: 'cnt-01',
    participant_id: 'p-01',
    team_name: 'WIMWI Mavericks',
    registered_at: '2026-10-28T10:00:00+05:30',
    status: 'confirmed'
  },
  {
    id: 'reg-02',
    event_id: 'evt-01',
    contingent_id: 'cnt-02',
    participant_id: 'p-05', // Rohit Verma
    team_name: 'Bangalore Bulls',
    registered_at: '2026-10-28T11:15:00+05:30',
    status: 'confirmed'
  },
  {
    id: 'reg-03',
    event_id: 'evt-03', // Rohit Verma registered for both evt-01 and evt-03 (Clash!)
    contingent_id: 'cnt-02',
    participant_id: 'p-05',
    team_name: 'Quant Minds',
    registered_at: '2026-10-28T14:20:00+05:30',
    status: 'confirmed'
  },
  {
    id: 'reg-04',
    event_id: 'evt-02',
    contingent_id: 'cnt-03',
    participant_id: 'p-08',
    team_name: 'Joka Orators',
    registered_at: '2026-10-29T09:00:00+05:30',
    status: 'confirmed'
  },
  {
    id: 'reg-05',
    event_id: 'evt-05',
    contingent_id: 'cnt-01',
    participant_id: 'p-03',
    team_name: 'IIMA Solo',
    registered_at: '2026-10-29T12:00:00+05:30',
    status: 'confirmed'
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-01',
    name: 'Annapurna Campus Gourmet & Catering',
    category: 'catering',
    contact_name: 'Chef Rajesh Rathore',
    contact_phone: '+91 94251 11222',
    hygiene_rating: 4.8,
    hygiene_cert_valid_until: '2026-12-31',
    operating_hours: '06:00 - 02:00 (All Day)',
    compliance_status: 'compliant',
    notes: 'Providing pure vegetarian & Jain segregated counters. Food safety inspection cleared Oct 29.'
  },
  {
    id: 'vnd-02',
    name: 'SoundCraft Pro AV & Concert Acoustics',
    category: 'stage_sound',
    contact_name: 'Harpreet Singh',
    contact_phone: '+91 98270 33445',
    hygiene_rating: 4.9,
    hygiene_cert_valid_until: '2027-04-15',
    operating_hours: '08:00 - 01:00',
    compliance_status: 'compliant',
    notes: 'Primary supplier for Central Audi & MDP Amphitheatre. On-site sound engineer team active.'
  },
  {
    id: 'vnd-03',
    name: 'Indore QuickCare Emergency Medical Services',
    category: 'medical',
    contact_name: 'Dr. Shalini Saxena',
    contact_phone: '+91 98930 55667',
    hygiene_rating: 5.0,
    hygiene_cert_valid_until: '2027-01-31',
    operating_hours: '24/7 Round the Clock',
    compliance_status: 'compliant',
    notes: '2 Advanced Life Support Ambulances parked at Sports Complex and Gate 2.'
  },
  {
    id: 'vnd-04',
    name: 'Apex Sentinel Security Force',
    category: 'security',
    contact_name: 'Inspector Virendra Baghel',
    contact_phone: '+91 94066 77889',
    hygiene_rating: 4.2,
    hygiene_cert_valid_until: '2026-11-30',
    operating_hours: '24/7 Rotary Shifts',
    compliance_status: 'warning',
    notes: 'Warning issued: Shift roster gap on Night Patrol 2. Replacement guards deployed.'
  },
  {
    id: 'vnd-05',
    name: 'Malwa Waste Solutions & Green Recycle',
    category: 'waste_management',
    contact_name: 'Dinesh Solanki',
    contact_phone: '+91 99770 12345',
    hygiene_rating: 3.1,
    hygiene_cert_valid_until: '2026-09-15', // Expired
    operating_hours: '07:00 - 19:00',
    compliance_status: 'breached',
    notes: 'CRITICAL: Municipal sanitary clearance expired. Fest Directorate issued an expedited notice.'
  }
];

export const INITIAL_LOGISTICS: InventoryLogistics[] = [
  {
    id: 'log-01',
    item_name: 'JBL VRX Line Array Speakers',
    category: 'av_equipment',
    total_quantity: 24,
    in_use_quantity: 16,
    available_quantity: 8,
    location: 'Central Audio Depot',
    condition: 'optimal'
  },
  {
    id: 'log-02',
    item_name: '500 kVA Mobile DG Genset (Silent)',
    category: 'power_generators',
    total_quantity: 4,
    in_use_quantity: 3,
    available_quantity: 1,
    location: 'Substation Perimeter',
    condition: 'optimal'
  },
  {
    id: 'log-03',
    item_name: 'Heavy Duty Mojo Crowd Barricades (m)',
    category: 'barricades',
    total_quantity: 250,
    in_use_quantity: 180,
    available_quantity: 70,
    location: 'Amphitheatre Buffer Zone',
    condition: 'optimal'
  },
  {
    id: 'log-04',
    item_name: 'VIP Banquet Chairs (Velvet Padded)',
    category: 'furniture',
    total_quantity: 600,
    in_use_quantity: 450,
    available_quantity: 150,
    location: 'Main Stage AV Depot',
    condition: 'optimal'
  },
  {
    id: 'log-05',
    item_name: 'Waterproof Octanorm German Hangar Canopy',
    category: 'canopy',
    total_quantity: 8,
    in_use_quantity: 6,
    available_quantity: 2,
    location: 'Sports Ground Pavilion',
    condition: 'needs_repair'
  }
];

export const INITIAL_MERCH: InventoryMerch[] = [
  {
    id: 'mrc-01',
    item_name: 'Aarohan 2026 Varsity Hoodies (Burgundy)',
    size: 'M',
    total_stock: 400,
    distributed_stock: 240,
    remaining_stock: 160,
    target_group: 'contingents'
  },
  {
    id: 'mrc-02',
    item_name: 'Aarohan 2026 Varsity Hoodies (Burgundy)',
    size: 'L',
    total_stock: 500,
    distributed_stock: 310,
    remaining_stock: 190,
    target_group: 'contingents'
  },
  {
    id: 'mrc-03',
    item_name: 'Core Team Tactical Windcheater (Matte Black)',
    size: 'L',
    total_stock: 120,
    distributed_stock: 95,
    remaining_stock: 25,
    target_group: 'core_team'
  },
  {
    id: 'mrc-04',
    item_name: 'Delegate Kits & NFC Smart Bands',
    size: 'Free Size',
    total_stock: 1500,
    distributed_stock: 890,
    remaining_stock: 610,
    target_group: 'all'
  }
];

export const INITIAL_CORE_TEAM: CoreTeamMember[] = [
  {
    id: 'tm-01',
    name: 'Prof. Animesh Sen',
    role: 'festival_director',
    phone: '+91 98260 11000',
    walkie_channel: 'Channel 1 (Gold/Exec)',
    shift_status: 'on_duty'
  },
  {
    id: 'tm-02',
    name: 'Samarth Kulkarni',
    role: 'ops_head',
    phone: '+91 98260 22001',
    walkie_channel: 'Channel 2 (Ops Command)',
    shift_status: 'on_duty'
  },
  {
    id: 'tm-03',
    name: 'Divya Agarwal',
    role: 'hospitality_lead',
    phone: '+91 98260 33002',
    walkie_channel: 'Channel 3 (Hospitality/Hostels)',
    shift_status: 'on_duty'
  },
  {
    id: 'tm-04',
    name: 'Kunal Chauhan',
    role: 'events_lead',
    phone: '+91 98260 44003',
    walkie_channel: 'Channel 4 (Events Stage)',
    shift_status: 'on_duty'
  },
  {
    id: 'tm-05',
    name: 'Major R.K. Bhonsle (Retd.)',
    role: 'security_chief',
    phone: '+91 98260 55004',
    walkie_channel: 'Channel 5 (Security Perimeter)',
    shift_status: 'on_duty'
  }
];

export const INITIAL_AUDIT_LOGS: OverrideAuditLog[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-30T09:31:00+05:30',
    actor: 'Divya Agarwal (Hospitality Lead)',
    action_type: 'accommodation_override',
    entity_id: 'p-06',
    entity_type: 'allocation',
    reason: 'Motorized wheelchair access: Allocated to ground floor MDP Executive suite overriding standard PGP double occupancy.',
    previous_state: 'Unallocated',
    new_state: 'Allocated: MDP-RES / Suite-01 / Bed A',
    approved_by: 'Prof. Animesh Sen (Director)'
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-30T10:15:00+05:30',
    actor: 'Samarth Kulkarni (Ops Head)',
    action_type: 'contingent_delay',
    entity_id: 'cnt-05',
    entity_type: 'contingent',
    reason: 'Flight UK-942 delay from DEL: Check-in extended by 3 hours, bed reservations locked.',
    previous_state: 'Status: expected (11:30)',
    new_state: 'Status: delayed (14:30)',
    approved_by: 'Samarth Kulkarni'
  }
];

