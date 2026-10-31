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
  OverrideAuditLog,
  OperationalAlert,
  StudentVolunteer,
  HostelRoom
} from '../types/database';
import canonicalJson from './canonicalAllocations.json';

export const INITIAL_CONTINGENTS: Contingent[] = canonicalJson.contingents as unknown as Contingent[];

export const INITIAL_HOSTELS: Hostel[] = canonicalJson.hostelBlocks as unknown as Hostel[];

export const INITIAL_HOSTEL_ROOMS: HostelRoom[] = canonicalJson.hostelRooms as unknown as HostelRoom[];

export const INITIAL_EXTERNAL_STAYS: ExternalStay[] = canonicalJson.externalStays as unknown as ExternalStay[];

export const INITIAL_EXTERNAL_ROOMS = canonicalJson.externalRooms;

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
  { id: 'E01', title: 'Aarohan', category: 'solo', venue_id: 'V01', start_time: '2026-10-30T09:00:00.000Z', end_time: '2026-10-30T10:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 90, venue_requirements: 'audio; seating', equipment_needs: 'barricades; tables', volunteers_needed: 10 },
  { id: 'E02', title: 'Pitch Perfect', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T10:45:00.000Z', end_time: '2026-10-30T11:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'open ground', equipment_needs: 'no special equipment', volunteers_needed: 11 },
  { id: 'E03', title: 'Case Clash', category: 'team', venue_id: 'V04', start_time: '2026-10-30T11:00:00.000Z', end_time: '2026-10-30T13:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'power; tables', equipment_needs: 'projector; 2 extension cords', volunteers_needed: 10 },
  { id: 'E04', title: 'Biz Quiz', category: 'solo', venue_id: 'V02', start_time: '2026-10-30T11:45:00.000Z', end_time: '2026-10-30T13:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'open ground', equipment_needs: 'no special equipment', volunteers_needed: 10 },
  { id: 'E05', title: 'Battle of Bands', category: 'solo', venue_id: 'V03', start_time: '2026-10-30T14:00:00.000Z', end_time: '2026-10-30T16:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'projector; seating', equipment_needs: 'barricades; tables', volunteers_needed: 12 },
  { id: 'E06', title: 'Street Play', category: 'team', venue_id: 'V05', start_time: '2026-10-30T14:30:00.000Z', end_time: '2026-10-30T15:15:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'quiet room', equipment_needs: 'barricades; tables', volunteers_needed: 2 },
  { id: 'E07', title: 'Nukkad Natak', category: 'solo', venue_id: 'V06', start_time: '2026-10-30T15:30:00.000Z', end_time: '2026-10-30T16:15:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'open ground', equipment_needs: 'camera; tripod', volunteers_needed: 2 },
  { id: 'E08', title: 'Treasure Hunt', category: 'solo', venue_id: 'V07', start_time: '2026-10-30T16:00:00.000Z', end_time: '2026-10-30T16:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'stage; lights', equipment_needs: 'projector; 2 extension cords', volunteers_needed: 2 },
  { id: 'E09', title: 'Code Relay', category: 'team', venue_id: 'V08', start_time: '2026-10-30T16:30:00.000Z', end_time: '2026-10-30T18:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'audio; seating', equipment_needs: 'barricades; tables', volunteers_needed: 2 },
  { id: 'E10', title: 'Design Sprint', category: 'solo', venue_id: 'V09', start_time: '2026-10-30T17:00:00.000Z', end_time: '2026-10-30T17:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'projector; seating', equipment_needs: 'camera; tripod', volunteers_needed: 3 },
  { id: 'E11', title: 'Debate', category: 'solo', venue_id: 'V03', start_time: '2026-10-30T18:00:00.000Z', end_time: '2026-10-30T19:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 60, venue_requirements: 'power; tables', equipment_needs: 'barricades; tables', volunteers_needed: 5 },
  { id: 'E12', title: 'MUN', category: 'team', venue_id: 'V05', start_time: '2026-10-31T09:30:00.000Z', end_time: '2026-10-31T11:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'audio; seating', equipment_needs: 'no special equipment', volunteers_needed: 5 },
  { id: 'E13', title: 'Poetry Slam', category: 'solo', venue_id: 'V06', start_time: '2026-10-31T10:00:00.000Z', end_time: '2026-10-31T12:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'open ground', equipment_needs: 'projector; 2 extension cords', volunteers_needed: 11 },
  { id: 'E14', title: 'Stand-up', category: 'solo', venue_id: 'V07', start_time: '2026-10-31T10:30:00.000Z', end_time: '2026-10-31T12:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'audio; seating', equipment_needs: 'projector; 2 extension cords', volunteers_needed: 4 },
  { id: 'E15', title: 'Photography Walk', category: 'team', venue_id: 'V08', start_time: '2026-10-31T11:00:00.000Z', end_time: '2026-10-31T13:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'audio; seating', equipment_needs: 'barricades; tables', volunteers_needed: 12 },
  { id: 'E16', title: 'Short Film', category: 'solo', venue_id: 'V09', start_time: '2026-10-31T13:30:00.000Z', end_time: '2026-10-31T15:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 90, venue_requirements: 'power; tables', equipment_needs: 'barricades; tables', volunteers_needed: 7 },
  { id: 'E17', title: 'Ad-Mad', category: 'solo', venue_id: 'V01', start_time: '2026-10-31T14:00:00.000Z', end_time: '2026-10-31T16:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'power; tables', equipment_needs: 'no special equipment', volunteers_needed: 3 },
  { id: 'E18', title: 'Stock Wars', category: 'team', venue_id: 'V04', start_time: '2026-10-31T14:30:00.000Z', end_time: '2026-10-31T16:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 90, venue_requirements: 'open ground', equipment_needs: 'no special equipment', volunteers_needed: 6 },
  { id: 'E19', title: 'IPL Auction', category: 'solo', venue_id: 'V02', start_time: '2026-10-31T15:30:00.000Z', end_time: '2026-10-31T16:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 60, venue_requirements: 'projector; seating', equipment_needs: '2 mics; 1 speaker', volunteers_needed: 10 },
  { id: 'E20', title: 'Dance Face-off', category: 'solo', venue_id: 'V05', start_time: '2026-10-31T16:30:00.000Z', end_time: '2026-10-31T17:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 60, venue_requirements: 'power; tables', equipment_needs: 'no special equipment', volunteers_needed: 10 },
  { id: 'E21', title: 'Fashion Show', category: 'team', venue_id: 'V01', start_time: '2026-10-31T18:00:00.000Z', end_time: '2026-10-31T19:00:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 60, venue_requirements: 'audio; seating', equipment_needs: 'barricades; tables', volunteers_needed: 7 },
  { id: 'E22', title: 'Open Mic', category: 'solo', venue_id: 'V06', start_time: '2026-10-31T19:30:00.000Z', end_time: '2026-10-31T21:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'audio; seating', equipment_needs: 'projector; 2 extension cords', volunteers_needed: 9 },
  { id: 'E23', title: 'Chess', category: 'solo', venue_id: 'V07', start_time: '2026-11-01T09:30:00.000Z', end_time: '2026-11-01T11:30:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'quiet room', equipment_needs: 'camera; tripod', volunteers_needed: 5 },
  { id: 'E24', title: 'Futsal', category: 'team', venue_id: 'V08', start_time: '2026-11-01T10:00:00.000Z', end_time: '2026-11-01T11:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 90, venue_requirements: 'open ground', equipment_needs: 'barricades; tables', volunteers_needed: 4 },
  { id: 'E25', title: 'Basketball', category: 'solo', venue_id: 'V08', start_time: '2026-11-01T11:45:00.000Z', end_time: '2026-11-01T12:45:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 60, venue_requirements: 'audio; seating', equipment_needs: 'no special equipment', volunteers_needed: 4 },
  { id: 'E26', title: 'Badminton', category: 'solo', venue_id: 'V09', start_time: '2026-11-01T13:00:00.000Z', end_time: '2026-11-01T15:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'quiet room', equipment_needs: 'barricades; tables', volunteers_needed: 2 },
  { id: 'E27', title: 'Table Tennis', category: 'team', venue_id: 'V09', start_time: '2026-11-01T15:15:00.000Z', end_time: '2026-11-01T17:15:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'projector; seating', equipment_needs: 'camera; tripod', volunteers_needed: 2 },
  { id: 'E28', title: 'Robo Race', category: 'solo', venue_id: 'V04', start_time: '2026-11-01T14:00:00.000Z', end_time: '2026-11-01T16:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'stage; lights', equipment_needs: 'no special equipment', volunteers_needed: 2 },
  { id: 'E29', title: 'Treasure Trivia', category: 'solo', venue_id: 'V02', start_time: '2026-11-01T15:30:00.000Z', end_time: '2026-11-01T16:15:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 45, venue_requirements: 'audio; seating', equipment_needs: '2 mics; 1 speaker', volunteers_needed: 11 },
  { id: 'E30', title: 'Startup Showcase', category: 'team', venue_id: 'V04', start_time: '2026-11-01T16:30:00.000Z', end_time: '2026-11-01T18:30:00.000Z', min_team_size: 1, max_team_size: 4, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'projector; seating', equipment_needs: 'barricades; tables', volunteers_needed: 11 },
  { id: 'E31', title: 'Grand Finale', category: 'solo', venue_id: 'V01', start_time: '2026-11-01T19:00:00.000Z', end_time: '2026-11-01T21:00:00.000Z', min_team_size: 1, max_team_size: 1, capacity_limit: 150, status: 'scheduled', duration_minutes: 120, venue_requirements: 'stage; lights', equipment_needs: 'no special equipment', volunteers_needed: 3 }
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

export const INITIAL_OPERATIONAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alert-01',
    alertCode: 'ALERT-EVT-01',
    severity: 'critical',
    eventId: 'E03',
    eventName: 'Case Clash',
    venueId: 'V04',
    venueName: 'Amphitheatre',
    title: 'Main Audio Console Surge Failure at Amphitheatre',
    problemDescription: 'Stage audio console breaker tripped during Case Clash preliminary round due to voltage fluctuation. Microphone lines 1-6 are silent.',
    operationalImpact: 'Presentations paused. 4 competing teams on stage waiting. Delay risk 20+ minutes.',
    requiredAction: 'Logistics team dispatch 5kVA backup UPS and mobile PA rack immediately. Events team pause timer.',
    reportedBy: 'Kunal Chauhan (Events Lead)',
    reportedRole: 'events',
    timestamp: '2026-10-31T06:15:00+05:30',
    status: 'active',
    acknowledgedBy: ['ST04 (Logistics)', 'ST08 (Director)']
  },
  {
    id: 'alert-02',
    alertCode: 'ALERT-EVT-02',
    severity: 'high',
    eventId: 'E09',
    eventName: 'Code Relay',
    venueId: 'V08',
    venueName: 'Sports Complex',
    title: 'Weather Warning: Lightning and Drizzle at Sports Complex',
    problemDescription: 'Campus weather telemetry reports approaching rain cell with localized lightning strikes detected within 4km radius.',
    operationalImpact: 'Outdoor cabling and power distribution boards at risk. 80 participants in open arena.',
    requiredAction: 'Prepare immediate contingency shift to LT-1. Logistics team stand by for indoor network routing.',
    reportedBy: 'Major R.K. Bhonsle (Security Chief)',
    reportedRole: 'director',
    timestamp: '2026-10-31T06:22:00+05:30',
    status: 'active',
    acknowledgedBy: ['ST03 (Events)']
  },
  {
    id: 'alert-03',
    alertCode: 'ALERT-EVT-03',
    severity: 'medium',
    eventId: 'E05',
    eventName: 'Battle of Bands',
    venueId: 'V03',
    venueName: 'LT-2',
    title: 'Sound Check Overrun and Drum Mic Channel Fault',
    problemDescription: 'Second band sound check exceeded allocated 15-minute slot by 12 minutes due to faulty XLR line on kick drum.',
    operationalImpact: 'Event schedule running 15 minutes behind schedule. Downstream slot E11 Debate may be squeezed.',
    requiredAction: 'Sound engineer swapped XLR line. Events desk authorized hard 10-minute cap on remaining sound checks.',
    reportedBy: 'Meera Khan (Volunteer Coordinator)',
    reportedRole: 'volunteer',
    timestamp: '2026-10-31T06:30:00+05:30',
    status: 'investigating',
    acknowledgedBy: ['ST03 (Events)']
  },
  {
    id: 'alert-04',
    alertCode: 'ALERT-EVT-04',
    severity: 'high',
    eventId: 'E01',
    eventName: 'Aarohan Opening Ceremony',
    venueId: 'V01',
    venueName: 'Auditorium',
    title: 'VIP Keynote Convoy Staggered at Airport Bypass',
    problemDescription: 'Keynote speaker convoy delayed by heavy freight traffic on Bypass Road. Estimated arrival delayed to 09:20 IST.',
    operationalImpact: 'Inauguration timing shifted back. Cultural prelude extended by 20 minutes to absorb buffer.',
    requiredAction: 'Protocol team to hold VIP green room reception. Registration desk continue participant seating.',
    reportedBy: 'Prof. Animesh Sen (Festival Director)',
    reportedRole: 'director',
    timestamp: '2026-10-31T06:35:00+05:30',
    status: 'active',
    acknowledgedBy: ['ST01 (Registration)', 'ST02 (Hospitality)']
  }
];

export const INITIAL_STUDENT_VOLUNTEERS: StudentVolunteer[] = [
  {
    id: 'vol-01',
    name: 'Aarav Sharma',
    rollNo: '2024MBA012',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10001',
    assignedEventId: 'E01',
    assignedEventName: 'Aarohan Opening',
    assignedVenue: 'Auditorium',
    assignedRole: 'Stage and AV Liaison',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-02',
    name: 'Pooja Patel',
    rollNo: '2023IPM045',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10002',
    assignedEventId: 'E01',
    assignedEventName: 'Aarohan Opening',
    assignedVenue: 'Auditorium',
    assignedRole: 'Audience and Seating Marshall',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-03',
    name: 'Rohan Mehta',
    rollNo: '2025PGP098',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10003',
    assignedEventId: 'E03',
    assignedEventName: 'Case Clash',
    assignedVenue: 'Amphitheatre',
    assignedRole: 'Case Tabulation and Scoring',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-04',
    name: 'Tanvi Joshi',
    rollNo: '2024MBA088',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10004',
    assignedEventId: 'E03',
    assignedEventName: 'Case Clash',
    assignedVenue: 'Amphitheatre',
    assignedRole: 'Jury Liaison',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-05',
    name: 'Aditya Nair',
    rollNo: '2023IPM014',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10005',
    assignedEventId: 'E05',
    assignedEventName: 'Battle of Bands',
    assignedVenue: 'LT-2',
    assignedRole: 'Sound and Stage Marshall',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-06',
    name: 'Sneha Roy',
    rollNo: '2024MBA112',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10006',
    assignedEventId: 'E05',
    assignedEventName: 'Battle of Bands',
    assignedVenue: 'LT-2',
    assignedRole: 'Team Registration Liaison',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-07',
    name: 'Kunal Singhal',
    rollNo: '2025PGP033',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10007',
    assignedEventId: 'E09',
    assignedEventName: 'Code Relay',
    assignedVenue: 'Sports Complex',
    assignedRole: 'Tech Arena Network Assist',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-08',
    name: 'Isha Verma',
    rollNo: '2023IPM099',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10008',
    assignedEventId: 'E09',
    assignedEventName: 'Code Relay',
    assignedVenue: 'Sports Complex',
    assignedRole: 'Hardware and Peripheral Runner',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-09',
    name: 'Vikram Rathore',
    rollNo: '2024MBA051',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10009',
    assignedEventId: 'E04',
    assignedEventName: 'Biz Quiz',
    assignedVenue: 'LT-1',
    assignedRole: 'Timekeeper and Gatekeeper',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-10',
    name: 'Ananya Deshmukh',
    rollNo: '2023IPM072',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10010',
    assignedEventId: 'E04',
    assignedEventName: 'Biz Quiz',
    assignedVenue: 'LT-1',
    assignedRole: 'Score Tabulator',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-11',
    name: 'Rahul Nair',
    rollNo: '2024MBA104',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10011',
    assignedEventId: 'E06',
    assignedEventName: 'Street Play',
    assignedVenue: 'Open Grounds',
    assignedRole: 'Street Arena Crowd Marshall',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-12',
    name: 'Swati Mishra',
    rollNo: '2025PGP041',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10012',
    assignedEventId: 'E06',
    assignedEventName: 'Street Play',
    assignedVenue: 'Open Grounds',
    assignedRole: 'Street Arena Liaison',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Morning (08:30 - 14:00)',
    status: 'deployed'
  },
  {
    id: 'vol-13',
    name: 'Deepak Choudhary',
    rollNo: '2024MBA077',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10013',
    assignedEventId: null,
    assignedRole: 'General Standby Reserve',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Standby (On Call)',
    status: 'standby'
  },
  {
    id: 'vol-14',
    name: 'Neha Kulkarni',
    rollNo: '2023IPM032',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10014',
    assignedEventId: null,
    assignedRole: 'General Standby Reserve',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Standby (On Call)',
    status: 'standby'
  },
  {
    id: 'vol-15',
    name: 'Arjun Reddy',
    rollNo: '2025PGP102',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10015',
    assignedEventId: null,
    assignedRole: 'General Standby Reserve',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Standby (On Call)',
    status: 'standby'
  },
  {
    id: 'vol-16',
    name: 'Kavya Menon',
    rollNo: '2024MBA063',
    college: 'IIM Indore (Host Student)',
    phone: '+91 98261 10016',
    assignedEventId: null,
    assignedRole: 'General Standby Reserve',
    voluntaryStatus: 'Voluntary Sign-up',
    shift: 'Standby (On Call)',
    status: 'standby'
  }
];
