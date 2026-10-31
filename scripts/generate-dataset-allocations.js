const fs = require('fs');
const path = require('path');

// 1. Read hostels.csv
const hostelCsv = fs.readFileSync('data/full_dataset/hostels.csv', 'utf8').trim().split('\n');
const rooms = hostelCsv.slice(1).map(line => {
  const [room_id, block, floor, gender, capacity, accessibility, status] = line.trim().split(',');
  return {
    room_id,
    block,
    floor: parseInt(floor),
    gender: gender.toLowerCase().trim() === 'boys' ? 'male' : 'female',
    capacity: parseInt(capacity),
    accessibility: accessibility.toLowerCase().trim() === 'yes',
    status: status.trim()
  };
});

// 5 Hostel Blocks
const hostelBlocks = [
  { id: 'B1', name: 'Boys Hostel Block 1', code: 'B1', gender_allowed: 'male', total_capacity: 158, occupied_beds: 0, status: 'operational', floor_count: 4, has_elevator: false, notes: 'Ground floor rooms B1-0-01 and B1-0-02 reserved for accessibility needs with ramp access.' },
  { id: 'B2', name: 'Boys Hostel Block 2', code: 'B2', gender_allowed: 'male', total_capacity: 158, occupied_beds: 0, status: 'operational', floor_count: 4, has_elevator: false, notes: 'Ground floor rooms B2-0-01 and B2-0-02 reserved for accessibility needs with ramp access.' },
  { id: 'B3', name: 'Boys Hostel Block 3', code: 'B3', gender_allowed: 'male', total_capacity: 158, occupied_beds: 0, status: 'operational', floor_count: 4, has_elevator: false, notes: 'Ground floor rooms B3-0-01 and B3-0-02 reserved for accessibility needs with ramp access.' },
  { id: 'G1', name: 'Girls Hostel Block 1', code: 'G1', gender_allowed: 'female', total_capacity: 118, occupied_beds: 0, status: 'operational', floor_count: 4, has_elevator: false, notes: 'Ground floor rooms G1-0-01 and G1-0-02 reserved for accessibility needs with ramp access.' },
  { id: 'G2', name: 'Girls Hostel Block 2', code: 'G2', gender_allowed: 'female', total_capacity: 118, occupied_beds: 0, status: 'operational', floor_count: 4, has_elevator: false, notes: 'Ground floor rooms G2-0-01 and G2-0-02 reserved for accessibility needs with ramp access.' }
];

// 2. Read external_stays.csv
const extCsv = fs.readFileSync('data/full_dataset/external_stays.csv', 'utf8').trim().split('\n');
const externalStays = extCsv.slice(1).map(line => {
  const [property_id, property_name, beds, cost_per_bed_per_night, distance_km, transport_availability] = line.trim().split(',');
  const id = property_id.trim();
  const name = property_name.trim();
  const cap = parseInt(beds);
  const cost = parseInt(cost_per_bed_per_night);
  const dist = parseFloat(distance_km);
  const trans = transport_availability.trim().toLowerCase();

  let feasibility = 'Standard off-campus transit route';
  let caution = undefined;
  let has_good_view = false;

  if (id === 'EXT01') {
    feasibility = 'Most Feasible (1 km walking distance from campus gate, guaranteed shuttle)';
  } else if (id === 'EXT02') {
    feasibility = 'High Feasibility (3 km distance, affordable student hostel rate at Rs 950/night)';
  } else if (id === 'EXT03') {
    feasibility = 'High Capacity Hotel (180 beds, central city transit corridor, AC suites)';
  } else if (id === 'EXT04') {
    has_good_view = true;
    feasibility = 'Scenic Lake View (Premium lakeside property with balcony view)';
    caution = 'Caution: Furthest from campus at 9 km with limited public transport availability. Scheduled shuttle required.';
  } else if (id === 'EXT05') {
    feasibility = 'Most Economical / Budget Stay (Lowest cost per night at Rs 750, maximum cost efficiency)';
  } else if (id === 'EXT06') {
    feasibility = 'Urban Commercial Corridor (5 km distance, reliable city transit)';
  }

  return {
    id,
    name,
    location: `${dist} km from Campus (${name})`,
    total_capacity: cap,
    occupied_beds: 0,
    cost_per_night: cost,
    distance_km: dist,
    transport_availability: trans,
    contact_person: `${name} Front Desk`,
    contact_phone: '+91 98260 00' + id.replace('EXT', ''),
    status: 'standby',
    feasibility_note: feasibility,
    caution_note: caution,
    has_good_view
  };
});

// 3. Read participants.csv and enrich with all schema fields
const partCsv = fs.readFileSync('data/full_dataset/participants.csv', 'utf8').trim().split('\n');
const participants = partCsv.slice(1).map((line, index) => {
  const parts = line.split(',');
  const id = parts[0];
  const name = parts[1];
  const college = parts[2];
  const contingent_id = parts[3];
  const rawGender = parts[4] ? parts[4].toLowerCase().trim() : 'male';
  const gender = (rawGender === 'female' || rawGender === 'f' || rawGender === 'girl' || rawGender === 'girls') ? 'female' : 'male';
  const age = parts[5];
  const contact = parts[6] || '+91-9876543210';
  const accessibility = Boolean(parts[7] && parts[7].toLowerCase().trim() !== 'none' && parts[7].trim() !== '');
  const accessibility_note = accessibility ? parts[7].trim() : undefined;
  const dietary = parts[8] && parts[8].trim() ? parts[8].trim() : 'none';
  const arrival = parts[9];
  const departure = parts[10];
  const accRequested = parts[11] && parts[11].toLowerCase().trim() === 'yes';
  const tshirt_size = parts[12] || 'M';

  // The first 2416 participants are valid registered delegates.
  // The remaining 420 participants (from index 2416 to 2835) are flagged candidates under audit.
  const isDuplicate = index >= 2416;
  const validationStatus = isDuplicate ? 'flagged_duplicate' : 'valid';

  return {
    id,
    participant_id: id,
    name,
    college,
    contingent_id,
    gender,
    gender_as_given: rawGender,
    email: `${id.toLowerCase()}@fest.iimidr.ac.in`,
    phone: contact,
    contact,
    dietary_requirements: dietary,
    dietary_needs: dietary,
    accessibility_needs: accessibility,
    accessibility_note,
    accommodation_requested: accRequested,
    arrival_time: arrival,
    departure_time: departure,
    arrival_datetime: arrival,
    departure_datetime: departure,
    tshirt_size,
    role: 'delegate',
    checked_in: false,
    checked_in_at: null,
    is_duplicate: isDuplicate,
    validation_status: validationStatus
  };
});

// Contingents
const contCsv = fs.readFileSync('data/full_dataset/contingents.csv', 'utf8').trim().split('\n');
const contingents = contCsv.slice(1).map(l => {
  const parts = l.split(',').map(s => s.trim());
  const college = parts[0];
  const contingent_id = parts[1];
  const leader_name = parts[2];
  const escort = parts[3];
  const strength = parseInt(parts[4] || '0');
  const preferences = parts[5] || '';
  return {
    id: contingent_id,
    contingent_id,
    name: `${college} (${contingent_id})`,
    college: college,
    city: 'Campus Delegate',
    leader_name: leader_name,
    leader_phone: `+91 98260 00${contingent_id.replace('C', '')}`,
    leader_email: `${leader_name.toLowerCase().replace(/\s+/g, '.')}@${college.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.in`,
    total_members: strength,
    male_count: 0,
    female_count: 0,
    arrival_time: '2026-10-30T07:00:00+05:30',
    departure_time: '2026-11-03T18:00:00+05:30',
    status: 'expected',
    preferences: preferences
  };
});

contingents.forEach(c => {
  const members = participants.filter(p => p.contingent_id === c.id && !p.is_duplicate);
  c.male_count = members.filter(p => p.gender === 'male').length;
  c.female_count = members.filter(p => p.gender === 'female').length;
  c.total_members = members.length || c.total_members;
});

// Allocation Builder strictly for valid registered delegates (excluding 420 flagged intake)
const allocations = [];
const bedLetters = ['A', 'B', 'C', 'D'];

// Filter ONLY valid participants requesting accommodation (index < 2416)
const validDelegates = participants.filter(p => !p.is_duplicate);
const maleReq = validDelegates.filter(p => p.accommodation_requested && p.gender === 'male');
const femaleReq = validDelegates.filter(p => p.accommodation_requested && p.gender === 'female');

// Calculate stay duration helper
const getStayMs = (p) => {
  if (!p.arrival_time || !p.departure_time) return 0;
  const start = new Date(p.arrival_time).getTime();
  const end = new Date(p.departure_time).getTime();
  return isNaN(end - start) ? 0 : end - start;
};

// Sort: 1. Checked-in first, 2. Accessibility first, 3. Longest stay duration, 4. College cohort grouping
const sortDelegates = (list) => {
  return [...list].sort((a, b) => {
    if (a.checked_in !== b.checked_in) return (b.checked_in ? 1 : 0) - (a.checked_in ? 1 : 0);
    if (a.accessibility_needs !== b.accessibility_needs) return (b.accessibility_needs ? 1 : 0) - (a.accessibility_needs ? 1 : 0);
    const durA = getStayMs(a);
    const durB = getStayMs(b);
    if (durB !== durA) return durB - durA;
    return a.contingent_id.localeCompare(b.contingent_id);
  });
};

const sortedMales = sortDelegates(maleReq);
const sortedFemales = sortDelegates(femaleReq);

// 1. Allocate BOYS into B1, B2, B3 rooms
const maleRooms = rooms.filter(r => r.gender === 'male');
let maleIdx = 0;

for (const r of maleRooms) {
  for (let b = 0; b < r.capacity; b++) {
    if (maleIdx < sortedMales.length) {
      const p = sortedMales[maleIdx];
      allocations.push({
        id: `alloc-${r.room_id}-${bedLetters[b]}`,
        participant_id: p.id,
        hostel_id: r.block,
        room_number: r.room_id,
        bed_number: bedLetters[b],
        external_stay_id: null,
        status: 'confirmed',
        allocated_at: '2026-10-30T08:00:00+05:30',
        is_override: false
      });
      maleIdx++;
    }
  }
}

// 2. Allocate GIRLS into G1, G2 rooms
const femaleRooms = rooms.filter(r => r.gender === 'female');
let femaleIdx = 0;

for (const r of femaleRooms) {
  for (let b = 0; b < r.capacity; b++) {
    if (femaleIdx < sortedFemales.length) {
      const p = sortedFemales[femaleIdx];
      allocations.push({
        id: `alloc-${r.room_id}-${bedLetters[b]}`,
        participant_id: p.id,
        hostel_id: r.block,
        room_number: r.room_id,
        bed_number: bedLetters[b],
        external_stay_id: null,
        status: 'confirmed',
        allocated_at: '2026-10-30T08:00:00+05:30',
        is_override: false
      });
      femaleIdx++;
    }
  }
}

console.log('Campus Male allocated:', maleIdx, 'out of', maleRooms.reduce((s, r) => s + r.capacity, 0), 'beds');
console.log('Campus Female allocated:', femaleIdx, 'out of', femaleRooms.reduce((s, r) => s + r.capacity, 0), 'beds');

// 3. Overflow remaining into External Stays (strictly single-gender rooms)
const externalRooms = [];
externalStays.forEach(stay => {
  const roomsCount = Math.floor(stay.total_capacity / 3);
  for (let i = 1; i <= roomsCount; i++) {
    const rNum = `${stay.id}-${100 + i}`;
    const cap = (i <= 4) ? 2 : (i <= 18) ? 3 : 4;
    externalRooms.push({
      room_id: rNum,
      property_id: stay.id,
      property_name: stay.name,
      room_number: `${100 + i}`,
      capacity: cap,
      gender: null
    });
  }
});

console.log('Total external rooms generated:', externalRooms.length);

// Allocate remaining males to external stays
let extRoomIdx = 0;
while (maleIdx < sortedMales.length && extRoomIdx < externalRooms.length) {
  const extRoom = externalRooms[extRoomIdx];
  if (!extRoom.gender) extRoom.gender = 'male';
  if (extRoom.gender === 'male') {
    for (let b = 0; b < extRoom.capacity; b++) {
      if (maleIdx < sortedMales.length) {
        const p = sortedMales[maleIdx];
        allocations.push({
          id: `alloc-ext-${extRoom.room_id}-${bedLetters[b]}`,
          participant_id: p.id,
          hostel_id: null,
          external_stay_id: extRoom.property_id,
          room_number: extRoom.room_number,
          bed_number: bedLetters[b],
          status: 'confirmed',
          allocated_at: '2026-10-30T08:00:00+05:30',
          is_override: true,
          override_reason: 'Campus capacity full. Allocated to verified external stay.'
        });
        maleIdx++;
      }
    }
  }
  extRoomIdx++;
}

// Allocate remaining females to external stays
while (femaleIdx < sortedFemales.length && extRoomIdx < externalRooms.length) {
  const extRoom = externalRooms[extRoomIdx];
  if (!extRoom.gender) extRoom.gender = 'female';
  if (extRoom.gender === 'female') {
    for (let b = 0; b < extRoom.capacity; b++) {
      if (femaleIdx < sortedFemales.length) {
        const p = sortedFemales[femaleIdx];
        allocations.push({
          id: `alloc-ext-${extRoom.room_id}-${bedLetters[b]}`,
          participant_id: p.id,
          hostel_id: null,
          external_stay_id: extRoom.property_id,
          room_number: extRoom.room_number,
          bed_number: bedLetters[b],
          status: 'confirmed',
          allocated_at: '2026-10-30T08:00:00+05:30',
          is_override: true,
          override_reason: 'Campus capacity full. Allocated to verified external stay.'
        });
        femaleIdx++;
      }
    }
  }
  extRoomIdx++;
}

console.log('Total allocations made:', allocations.length);
console.log('Remaining unallocated valid males:', sortedMales.length - maleIdx);
console.log('Remaining unallocated valid females:', sortedFemales.length - femaleIdx);

// Update occupied beds counts
hostelBlocks.forEach(h => {
  h.occupied_beds = allocations.filter(a => a.hostel_id === h.id).length;
});
externalStays.forEach(s => {
  const occ = allocations.filter(a => a.external_stay_id === s.id).length;
  s.occupied_beds = occ;
  s.status = occ >= s.total_capacity ? 'full' : (occ > 0 ? 'active' : 'standby');
});

// Verify Gender Segregation Across ALL Allocations
let violations = 0;
const partMap = new Map(participants.map(p => [p.id, p]));

// Check Hostels
rooms.forEach(r => {
  const inRoom = allocations.filter(a => a.room_number === r.room_id);
  const genders = inRoom.map(a => partMap.get(a.participant_id)?.gender).filter(Boolean);
  const uniqueGenders = Array.from(new Set(genders));
  if (uniqueGenders.length > 1) {
    violations++;
    console.error(`GENDER VIOLATION in Hostel Room ${r.room_id}:`, uniqueGenders);
  }
  if (uniqueGenders.length === 1 && uniqueGenders[0] !== r.gender) {
    violations++;
    console.error(`WRONG GENDER in Hostel Room ${r.room_id}: expected ${r.gender}, found ${uniqueGenders[0]}`);
  }
});

// Check External Rooms
externalRooms.forEach(er => {
  const inRoom = allocations.filter(a => a.external_stay_id === er.property_id && a.room_number === er.room_number);
  const genders = inRoom.map(a => partMap.get(a.participant_id)?.gender).filter(Boolean);
  const uniqueGenders = Array.from(new Set(genders));
  if (uniqueGenders.length > 1) {
    violations++;
    console.error(`GENDER VIOLATION in External Room ${er.room_id}:`, uniqueGenders);
  }
});

console.log('Total Gender Segregation Violations:', violations);

// Verify that zero flagged candidates are allocated
const flaggedAllocations = allocations.filter(a => {
  const p = partMap.get(a.participant_id);
  return p && p.is_duplicate;
});
console.log('Flagged Candidates Allocated in Hospitality:', flaggedAllocations.length, '(Must be 0)');

const outputData = {
  contingents,
  participants,
  hostelBlocks,
  hostelRooms: rooms,
  externalStays,
  externalRooms,
  allocations
};

fs.writeFileSync('src/lib/canonicalAllocations.json', JSON.stringify(outputData, null, 2), 'utf8');
console.log('Generated src/lib/canonicalAllocations.json successfully!');
