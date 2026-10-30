import { db } from './db';

export async function migrate() {
  console.log('Running database migrations...');

  // 1. Raw layer (all text columns + _row_number + _source_file)
  const rawTables = `
    CREATE TABLE IF NOT EXISTS raw_contingents (
      _row_number INT,
      _source_file TEXT,
      college TEXT,
      contingent_id TEXT,
      leader TEXT,
      escort TEXT,
      strength_declared TEXT,
      preferences TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_core_team (
      _row_number INT,
      _source_file TEXT,
      member_id TEXT,
      name TEXT,
      role TEXT,
      shift TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_events (
      _row_number INT,
      _source_file TEXT,
      event_id TEXT,
      event_name TEXT,
      type TEXT,
      rounds TEXT,
      duration_minutes TEXT,
      venue_requirements TEXT,
      equipment_needs TEXT,
      volunteers_needed TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_external_stays (
      _row_number INT,
      _source_file TEXT,
      property_id TEXT,
      property_name TEXT,
      beds TEXT,
      cost_per_bed_per_night TEXT,
      distance_km TEXT,
      transport_availability TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_hostels (
      _row_number INT,
      _source_file TEXT,
      room_id TEXT,
      block TEXT,
      floor TEXT,
      gender TEXT,
      capacity TEXT,
      accessibility TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_inventory_logistics (
      _row_number INT,
      _source_file TEXT,
      item_id TEXT,
      item TEXT,
      quantity TEXT,
      location TEXT,
      condition TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_inventory_merch (
      _row_number INT,
      _source_file TEXT,
      item TEXT,
      size TEXT,
      quantity TEXT,
      reserved_quantity TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_participants (
      _row_number INT,
      _source_file TEXT,
      participant_id TEXT,
      name TEXT,
      college TEXT,
      contingent_id TEXT,
      gender_as_given TEXT,
      age TEXT,
      contact TEXT,
      accessibility_needs TEXT,
      dietary_needs TEXT,
      arrival_datetime TEXT,
      departure_datetime TEXT,
      accommodation_requested TEXT,
      tshirt_size TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_registrations (
      _row_number INT,
      _source_file TEXT,
      participant_id TEXT,
      event_id TEXT,
      team_id TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_vendors (
      _row_number INT,
      _source_file TEXT,
      vendor_id TEXT,
      vendor_name TEXT,
      menu TEXT,
      dietary_options TEXT,
      hygiene_certificate_expiry TEXT,
      hours TEXT,
      capacity TEXT,
      payment_terms TEXT
    );

    CREATE TABLE IF NOT EXISTS raw_venues (
      _row_number INT,
      _source_file TEXT,
      venue_id TEXT,
      venue_name TEXT,
      capacity TEXT,
      availability_windows TEXT,
      indoor_outdoor TEXT
    );
  `;

  await db.exec(rawTables);

  // Schema evolution check for app_users
  try {
    const colCheck = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'app_users' AND column_name = 'login_id';"
    );
    if (colCheck.rows.length === 0) {
      await db.exec('DROP TABLE IF EXISTS app_users CASCADE;');
    }
  } catch (e) {
    // app_users does not exist yet
  }

  // 2. Normalized Tables
  const normalizedTables = `
    CREATE TABLE IF NOT EXISTS import_issues (
      id TEXT PRIMARY KEY,
      file TEXT NOT NULL,
      row_number INT NOT NULL,
      field TEXT,
      severity TEXT NOT NULL,
      issue_type TEXT NOT NULL,
      description TEXT NOT NULL,
      suggested_action TEXT,
      raw_value TEXT,
      status TEXT DEFAULT 'open',
      resolved_by TEXT,
      resolved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS assumptions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS duplicate_candidates (
      id TEXT PRIMARY KEY,
      primary_id TEXT NOT NULL,
      duplicate_id TEXT NOT NULL,
      match_criteria TEXT NOT NULL,
      confidence NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      resolution_note TEXT,
      resolved_by TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contingents (
      contingent_id TEXT PRIMARY KEY,
      college TEXT NOT NULL,
      leader_name TEXT,
      escort_name TEXT,
      strength_declared INT,
      preferences TEXT
    );

    CREATE TABLE IF NOT EXISTS core_team (
      member_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      shift TEXT NOT NULL,
      phone TEXT,
      assigned_role_key TEXT
    );

    CREATE TABLE IF NOT EXISTS venues (
      venue_id TEXT PRIMARY KEY,
      venue_name TEXT NOT NULL,
      capacity INT NOT NULL,
      availability_windows TEXT,
      indoor_outdoor TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      type TEXT NOT NULL,
      rounds INT DEFAULT 1,
      duration_minutes INT NOT NULL,
      venue_requirements TEXT,
      equipment_needs TEXT,
      volunteers_needed INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS judge_assignments (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(event_id),
      round INT DEFAULT 1,
      name TEXT,
      source TEXT
    );

    CREATE TABLE IF NOT EXISTS hostel_rooms (
      room_id TEXT PRIMARY KEY,
      block TEXT NOT NULL,
      floor INT NOT NULL,
      gender TEXT NOT NULL,
      capacity INT NOT NULL,
      accessibility BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS external_stays (
      property_id TEXT PRIMARY KEY,
      property_name TEXT NOT NULL,
      beds INT NOT NULL,
      cost_per_bed_per_night NUMERIC NOT NULL,
      distance_km NUMERIC NOT NULL,
      transport_availability TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_logistics (
      item_id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      quantity INT NOT NULL,
      location TEXT,
      condition TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_merch (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INT NOT NULL,
      reserved_quantity INT DEFAULT 0,
      CONSTRAINT unq_item_size UNIQUE (item, size)
    );

    CREATE TABLE IF NOT EXISTS vendors (
      vendor_id TEXT PRIMARY KEY,
      vendor_name TEXT NOT NULL,
      menu TEXT,
      dietary_options TEXT,
      hygiene_certificate_expiry DATE,
      hours TEXT,
      capacity INT,
      payment_terms TEXT
    );

    CREATE TABLE IF NOT EXISTS participants (
      participant_id TEXT PRIMARY KEY,
      canonical_id TEXT,
      name TEXT NOT NULL,
      college TEXT NOT NULL,
      contingent_id TEXT REFERENCES contingents(contingent_id),
      gender_as_given TEXT,
      normalized_gender TEXT,
      age INT,
      contact TEXT,
      accessibility_needs TEXT,
      dietary_needs TEXT,
      arrival_datetime TIMESTAMPTZ,
      departure_datetime TIMESTAMPTZ,
      accommodation_requested BOOLEAN,
      tshirt_size TEXT,
      is_duplicate BOOLEAN DEFAULT FALSE,
      is_flagged BOOLEAN DEFAULT FALSE,
      validation_status TEXT DEFAULT 'valid',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL REFERENCES participants(participant_id),
      event_id TEXT NOT NULL REFERENCES events(event_id),
      team_id TEXT,
      status TEXT DEFAULT 'confirmed'
    );

    CREATE TABLE IF NOT EXISTS schedule_slots (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(event_id),
      round INT DEFAULT 1,
      venue_id TEXT NOT NULL REFERENCES venues(venue_id),
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'scheduled'
    );

    CREATE TABLE IF NOT EXISTS bed_allocations (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL REFERENCES participants(participant_id),
      assignment_type TEXT NOT NULL,
      room_id TEXT REFERENCES hostel_rooms(room_id),
      property_id TEXT REFERENCES external_stays(property_id),
      allocated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      participant_id TEXT PRIMARY KEY REFERENCES participants(participant_id),
      status TEXT NOT NULL,
      checked_in_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      actor_id TEXT,
      desk TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      from_role TEXT NOT NULL,
      to_role TEXT NOT NULL,
      type TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::jsonb,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      requested_by TEXT NOT NULL,
      entity_table TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::jsonb,
      reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
      status TEXT DEFAULT 'pending',
      decided_by TEXT,
      decided_reason TEXT,
      decided_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      assignee_id TEXT NOT NULL,
      venue_id TEXT REFERENCES venues(venue_id),
      event_id TEXT REFERENCES events(event_id),
      title TEXT NOT NULL,
      window_start TIMESTAMPTZ,
      window_end TIMESTAMPTZ,
      status TEXT DEFAULT 'pending',
      completed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      reported_by TEXT NOT NULL,
      venue_id TEXT REFERENCES venues(venue_id),
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meal_slots (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      meal TEXT NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vendor_assignments (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL REFERENCES vendors(vendor_id),
      meal_slot_id TEXT NOT NULL REFERENCES meal_slots(id),
      expected_covers INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      owner_role TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      acknowledged_by TEXT,
      acknowledged_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      login_id TEXT UNIQUE NOT NULL,
      core_team_id TEXT NOT NULL REFERENCES core_team(member_id),
      role_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      must_change_password BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      login_id TEXT NOT NULL,
      ip TEXT,
      success BOOLEAN NOT NULL,
      attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_lookup ON login_attempts(login_id, attempted_at DESC);
    CREATE INDEX IF NOT EXISTS idx_app_users_login_id ON app_users(login_id);

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
      before_state JSONB,
      after_state JSONB,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS merch_issuances (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      canonical_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      size TEXT NOT NULL,
      issued_by TEXT NOT NULL,
      issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unq_merch_canonical_item UNIQUE (canonical_id, item_type)
    );
  `;

  await db.exec(normalizedTables);

  // 3. Indexes
  const indexes = `
    CREATE INDEX IF NOT EXISTS idx_participants_canonical ON participants(canonical_id);
    CREATE INDEX IF NOT EXISTS idx_participants_contingent ON participants(contingent_id);
    CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(validation_status);
    CREATE INDEX IF NOT EXISTS idx_registrations_participant ON registrations(participant_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_bed_alloc_participant ON bed_allocations(participant_id);
    CREATE INDEX IF NOT EXISTS idx_bed_alloc_room ON bed_allocations(room_id);
    CREATE INDEX IF NOT EXISTS idx_bed_alloc_property ON bed_allocations(property_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_event ON schedule_slots(event_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_venue ON schedule_slots(venue_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_owner ON alerts(owner_role);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_requests_to_role ON requests(to_role);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
    CREATE INDEX IF NOT EXISTS idx_issues_type ON import_issues(issue_type);
    CREATE INDEX IF NOT EXISTS idx_issues_severity ON import_issues(severity);
  `;
  await db.exec(indexes);

  // 4. Aggregate SQL Views
  const views = `
    CREATE OR REPLACE VIEW v_checkin_progress AS
    SELECT
      COUNT(DISTINCT p.canonical_id) AS total_canonical,
      COUNT(DISTINCT CASE WHEN c.status = 'checked_in' THEN p.canonical_id END) AS checked_in_count,
      ROUND(
        COUNT(DISTINCT CASE WHEN c.status = 'checked_in' THEN p.canonical_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT p.canonical_id), 0), 2
      ) AS checkin_percentage
    FROM participants p
    LEFT JOIN check_ins c ON p.participant_id = c.participant_id
    WHERE p.validation_status != 'rejected';

    CREATE OR REPLACE VIEW v_bed_occupancy AS
    SELECT
      hr.room_id,
      hr.block,
      hr.floor,
      hr.gender,
      hr.capacity,
      COUNT(ba.id) AS occupied_beds,
      hr.capacity - COUNT(ba.id) AS available_beds
    FROM hostel_rooms hr
    LEFT JOIN bed_allocations ba ON hr.room_id = ba.room_id AND ba.status = 'active'
    GROUP BY hr.room_id, hr.block, hr.floor, hr.gender, hr.capacity;

    CREATE OR REPLACE VIEW v_dietary_demand AS
    SELECT
      COALESCE(dietary_needs, 'Not Specified') AS dietary_option,
      COUNT(*) AS participant_count
    FROM participants
    WHERE validation_status != 'rejected'
    GROUP BY dietary_needs;

    CREATE OR REPLACE VIEW v_merch_stock AS
    SELECT
      im.id,
      im.item,
      im.size,
      im.quantity AS total_stock,
      im.reserved_quantity,
      COUNT(mi.id) AS issued_count,
      (im.quantity - COUNT(mi.id)) AS available_balance
    FROM inventory_merch im
    LEFT JOIN merch_issuances mi ON im.item = mi.item_type AND im.size = mi.size
    GROUP BY im.id, im.item, im.size, im.quantity, im.reserved_quantity;

    CREATE OR REPLACE VIEW v_equipment_demand AS
    SELECT
      il.item_id,
      il.item,
      il.quantity AS inventory_quantity,
      il.location,
      il.condition
    FROM inventory_logistics il;
  `;

  await db.exec(views);
  console.log('Database migrations completed successfully.');
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration finished.');
      return db.close();
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
