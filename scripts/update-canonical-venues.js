const fs = require('fs');

// 1. Update DisruptionInjectorView.tsx
let disContent = fs.readFileSync('src/components/disruptions/DisruptionInjectorView.tsx', 'utf8');
disContent = disContent
  .replace(/Chanakya Hall/g, 'Main Stage')
  .replace(/Central Auditorium/g, 'LT-1')
  .replace(/Boardroom Blitz/g, 'Aarohan')
  .replace(/eventId: 'evt-05', newVenueId: 'ven-01'/g, "eventId: 'E01', newVenueId: 'V02'");
fs.writeFileSync('src/components/disruptions/DisruptionInjectorView.tsx', disContent, 'utf8');
console.log('Updated DisruptionInjectorView.tsx');

// 2. Update mockData.ts
let mock = fs.readFileSync('src/lib/mockData.ts', 'utf8');
mock = mock.replace(/Chanakya Storage Cell/g, 'Main Stage AV Depot');

const vStart = mock.indexOf('export const INITIAL_VENUES: Venue[] = [');
const eEnd = mock.indexOf('export const INITIAL_REGISTRATIONS: Registration[] = [');

const replacement = `export const INITIAL_VENUES: Venue[] = [
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

`;

mock = mock.slice(0, vStart) + replacement + mock.slice(eEnd);
fs.writeFileSync('src/lib/mockData.ts', mock, 'utf8');
console.log('Successfully updated mockData.ts with canonical venues and events.');

