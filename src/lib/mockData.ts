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

export const INITIAL_CONTINGENTS: Contingent[] = [
  {
    id: 'cnt-01',
    name: 'IIM Ahmedabad (WIMWI)',
    college: 'Indian Institute of Management Ahmedabad',
    city: 'Ahmedabad',
    leader_name: 'Aarav Sharma',
    leader_phone: '+91 98765 43210',
    leader_email: 'aarav.s@iima.ac.in',
    total_members: 42,
    male_count: 24,
    female_count: 18,
    arrival_time: '2026-10-30T07:30:00+05:30',
    departure_time: '2026-11-02T18:00:00+05:30',
    status: 'arrived'
  },
  {
    id: 'cnt-02',
    name: 'IIM Bangalore (The Place to B)',
    college: 'Indian Institute of Management Bangalore',
    city: 'Bengaluru',
    leader_name: 'Ananya Iyer',
    leader_phone: '+91 98234 56789',
    leader_email: 'ananya.i@iimb.ac.in',
    total_members: 38,
    male_count: 20,
    female_count: 18,
    arrival_time: '2026-10-30T09:15:00+05:30',
    departure_time: '2026-11-02T19:00:00+05:30',
    status: 'arrived'
  },
  {
    id: 'cnt-03',
    name: 'IIM Calcutta (Joka Tribe)',
    college: 'Indian Institute of Management Calcutta',
    city: 'Kolkata',
    leader_name: 'Siddharth Mukherjee',
    leader_phone: '+91 97112 34567',
    leader_email: 'siddharth.m@iimc.ac.in',
    total_members: 35,
    male_count: 21,
    female_count: 14,
    arrival_time: '2026-10-30T11:00:00+05:30',
    departure_time: '2026-11-02T20:30:00+05:30',
    status: 'arrived'
  },
  {
    id: 'cnt-04',
    name: 'XLRI Jamshedpur',
    college: 'Xavier School of Management',
    city: 'Jamshedpur',
    leader_name: 'Pooja Nair',
    leader_phone: '+91 96543 21098',
    leader_email: 'pooja.n@xlri.ac.in',
    total_members: 28,
    male_count: 15,
    female_count: 13,
    arrival_time: '2026-10-30T13:45:00+05:30',
    departure_time: '2026-11-02T16:00:00+05:30',
    status: 'expected'
  },
  {
    id: 'cnt-05',
    name: 'FMS Delhi (Red Building of Dreams)',
    college: 'Faculty of Management Studies, DU',
    city: 'New Delhi',
    leader_name: 'Rohan Malhotra',
    leader_phone: '+91 98101 23456',
    leader_email: 'rohan.m@fms.edu',
    total_members: 25,
    male_count: 14,
    female_count: 11,
    arrival_time: '2026-10-30T14:30:00+05:30',
    departure_time: '2026-11-02T17:00:00+05:30',
    status: 'delayed'
  },
  {
    id: 'cnt-06',
    name: 'SPJIMR Mumbai',
    college: 'S.P. Jain Institute of Management and Research',
    city: 'Mumbai',
    leader_name: 'Tanvi Deshmukh',
    leader_phone: '+91 99203 45671',
    leader_email: 'tanvi.d@spjimr.org',
    total_members: 24,
    male_count: 12,
    female_count: 12,
    arrival_time: '2026-10-30T08:00:00+05:30',
    departure_time: '2026-11-02T18:30:00+05:30',
    status: 'arrived'
  },
  {
    id: 'cnt-07',
    name: 'SJMSOM IIT Bombay',
    college: 'Shailesh J. Mehta SOM, IIT Bombay',
    city: 'Mumbai',
    leader_name: 'Kabir Singhania',
    leader_phone: '+91 98450 11223',
    leader_email: 'kabir.s@som.iitb.ac.in',
    total_members: 20,
    male_count: 13,
    female_count: 7,
    arrival_time: '2026-10-30T10:30:00+05:30',
    departure_time: '2026-11-02T19:00:00+05:30',
    status: 'arrived'
  },
  {
    id: 'cnt-08',
    name: 'NMIMS Mumbai',
    college: 'Narsee Monjee Institute of Management Studies',
    city: 'Mumbai',
    leader_name: 'Meera Kapoor',
    leader_phone: '+91 98200 98765',
    leader_email: 'meera.k@nmims.edu',
    total_members: 18,
    male_count: 9,
    female_count: 9,
    arrival_time: '2026-10-30T12:00:00+05:30',
    departure_time: '2026-11-02T15:30:00+05:30',
    status: 'expected'
  }
];

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

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p-01',
    contingent_id: 'cnt-01',
    name: 'Aarav Sharma',
    email: 'aarav.s@iima.ac.in',
    phone: '+91 98765 43210',
    gender: 'male',
    dietary_requirements: 'veg',
    accessibility_needs: false,
    role: 'leader',
    checked_in: true,
    checked_in_at: '2026-10-30T07:45:00+05:30'
  },
  {
    id: 'p-02',
    contingent_id: 'cnt-01',
    name: 'Priya Sundaram',
    email: 'priya.s@iima.ac.in',
    phone: '+91 98765 43211',
    gender: 'female',
    dietary_requirements: 'jain',
    accessibility_needs: true,
    accessibility_note: 'Requires Ground Floor room due to mobility brace',
    role: 'delegate',
    checked_in: true,
    checked_in_at: '2026-10-30T07:50:00+05:30'
  },
  {
    id: 'p-03',
    contingent_id: 'cnt-01',
    name: 'Devansh Parekh',
    email: 'devansh.p@iima.ac.in',
    phone: '+91 98765 43212',
    gender: 'male',
    dietary_requirements: 'jain',
    accessibility_needs: false,
    role: 'performer',
    checked_in: true,
    checked_in_at: '2026-10-30T08:00:00+05:30'
  },
  {
    id: 'p-04',
    contingent_id: 'cnt-02',
    name: 'Ananya Iyer',
    email: 'ananya.i@iimb.ac.in',
    phone: '+91 98234 56789',
    gender: 'female',
    dietary_requirements: 'veg',
    accessibility_needs: false,
    role: 'leader',
    checked_in: true,
    checked_in_at: '2026-10-30T09:20:00+05:30'
  },
  {
    id: 'p-05',
    contingent_id: 'cnt-02',
    name: 'Rohit Verma',
    email: 'rohit.v@iimb.ac.in',
    phone: '+91 98234 56790',
    gender: 'male',
    dietary_requirements: 'none',
    accessibility_needs: false,
    role: 'delegate',
    checked_in: true,
    checked_in_at: '2026-10-30T09:25:00+05:30'
  },
  {
    id: 'p-06',
    contingent_id: 'cnt-02',
    name: 'Deepak Reddy',
    email: 'deepak.r@iimb.ac.in',
    phone: '+91 98234 56791',
    gender: 'male',
    dietary_requirements: 'halal',
    accessibility_needs: true,
    accessibility_note: 'Wheelchair assistance requested for campus commute',
    role: 'sports',
    checked_in: true,
    checked_in_at: '2026-10-30T09:30:00+05:30'
  },
  {
    id: 'p-07',
    contingent_id: 'cnt-03',
    name: 'Siddharth Mukherjee',
    email: 'siddharth.m@iimc.ac.in',
    phone: '+91 97112 34567',
    gender: 'male',
    dietary_requirements: 'none',
    accessibility_needs: false,
    role: 'leader',
    checked_in: true,
    checked_in_at: '2026-10-30T11:10:00+05:30'
  },
  {
    id: 'p-08',
    contingent_id: 'cnt-03',
    name: 'Sneha Sen',
    email: 'sneha.s@iimc.ac.in',
    phone: '+91 97112 34568',
    gender: 'female',
    dietary_requirements: 'vegan',
    accessibility_needs: false,
    role: 'delegate',
    checked_in: true,
    checked_in_at: '2026-10-30T11:15:00+05:30'
  },
  {
    id: 'p-09',
    contingent_id: 'cnt-04',
    name: 'Pooja Nair',
    email: 'pooja.n@xlri.ac.in',
    phone: '+91 96543 21098',
    gender: 'female',
    dietary_requirements: 'veg',
    accessibility_needs: false,
    role: 'leader',
    checked_in: false,
    checked_in_at: null
  },
  {
    id: 'p-10',
    contingent_id: 'cnt-05',
    name: 'Rohan Malhotra',
    email: 'rohan.m@fms.edu',
    phone: '+91 98101 23456',
    gender: 'male',
    dietary_requirements: 'none',
    accessibility_needs: false,
    role: 'leader',
    checked_in: false,
    checked_in_at: null
  },
  {
    id: 'p-11',
    contingent_id: 'cnt-06',
    name: 'Tanvi Deshmukh',
    email: 'tanvi.d@spjimr.org',
    phone: '+91 99203 45671',
    gender: 'female',
    dietary_requirements: 'jain',
    accessibility_needs: false,
    role: 'leader',
    checked_in: true,
    checked_in_at: '2026-10-30T08:15:00+05:30'
  },
  {
    id: 'p-12',
    contingent_id: 'cnt-07',
    name: 'Kabir Singhania',
    email: 'kabir.s@som.iitb.ac.in',
    phone: '+91 98450 11223',
    gender: 'male',
    dietary_requirements: 'none',
    accessibility_needs: false,
    role: 'leader',
    checked_in: true,
    checked_in_at: '2026-10-30T10:40:00+05:30'
  }
];

export const INITIAL_ALLOCATIONS: AccommodationAllocation[] = [
  {
    id: 'alloc-01',
    participant_id: 'p-01',
    hostel_id: 'hostel-02',
    room_number: '101',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T07:46:00+05:30'
  },
  {
    id: 'alloc-02',
    participant_id: 'p-02',
    hostel_id: 'hostel-01',
    room_number: 'G04',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T07:51:00+05:30',
    is_override: false
  },
  {
    id: 'alloc-03',
    participant_id: 'p-03',
    hostel_id: 'hostel-02',
    room_number: '101',
    bed_number: 'B',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T08:01:00+05:30'
  },
  {
    id: 'alloc-04',
    participant_id: 'p-04',
    hostel_id: 'hostel-01',
    room_number: '105',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T09:21:00+05:30'
  },
  {
    id: 'alloc-05',
    participant_id: 'p-05',
    hostel_id: 'hostel-02',
    room_number: '204',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T09:26:00+05:30'
  },
  {
    id: 'alloc-06',
    participant_id: 'p-06',
    hostel_id: 'hostel-05',
    room_number: 'Suite-01',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T09:31:00+05:30',
    is_override: true,
    override_reason: 'Allocated to MDP Ground Floor Suite for motorized wheelchair accessibility.'
  },
  {
    id: 'alloc-07',
    participant_id: 'p-07',
    hostel_id: 'hostel-03',
    room_number: '112',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T11:11:00+05:30'
  },
  {
    id: 'alloc-08',
    participant_id: 'p-08',
    hostel_id: 'hostel-04',
    room_number: '208',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T11:16:00+05:30'
  },
  {
    id: 'alloc-09',
    participant_id: 'p-11',
    hostel_id: 'hostel-01',
    room_number: '210',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T08:16:00+05:30'
  },
  {
    id: 'alloc-10',
    participant_id: 'p-12',
    hostel_id: 'hostel-03',
    room_number: '114',
    bed_number: 'A',
    external_stay_id: null,
    status: 'confirmed',
    allocated_at: '2026-10-30T10:41:00+05:30'
  }
];

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

