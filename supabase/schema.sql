-- ============================================================================
-- FestOS: IIM Indore Aarohan 2026 Production Schema
-- Supports Realtime subscriptions, constraints & audit logging
-- ============================================================================

-- 1. Contingents Table
CREATE TABLE IF NOT EXISTS contingents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    college VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    leader_name VARCHAR(255) NOT NULL,
    leader_phone VARCHAR(50) NOT NULL,
    leader_email VARCHAR(255) NOT NULL,
    total_members INT NOT NULL DEFAULT 0,
    male_count INT NOT NULL DEFAULT 0,
    female_count INT NOT NULL DEFAULT 0,
    arrival_time TIMESTAMPTZ NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'expected' CHECK (status IN ('expected', 'arrived', 'delayed', 'checked_out')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contingent_id UUID REFERENCES contingents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    dietary_requirements VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (dietary_requirements IN ('none', 'veg', 'jain', 'vegan', 'halal')),
    accessibility_needs BOOLEAN NOT NULL DEFAULT FALSE,
    accessibility_note TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'delegate' CHECK (role IN ('leader', 'delegate', 'performer', 'sports')),
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    gender_allowed VARCHAR(20) NOT NULL CHECK (gender_allowed IN ('male', 'female', 'all')),
    total_capacity INT NOT NULL DEFAULT 0,
    occupied_beds INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'closed', 'maintenance')),
    floor_count INT NOT NULL DEFAULT 3,
    has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. External Overflow Stays Table
CREATE TABLE IF NOT EXISTS external_stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_capacity INT NOT NULL DEFAULT 0,
    occupied_beds INT NOT NULL DEFAULT 0,
    cost_per_night NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'standby' CHECK (status IN ('standby', 'active', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Accommodation Allocations Table
CREATE TABLE IF NOT EXISTS accommodation_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    hostel_id UUID REFERENCES hostels(id) ON DELETE SET NULL,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    external_stay_id UUID REFERENCES external_stays(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'allocated' CHECK (status IN ('allocated', 'confirmed', 'vacated')),
    allocated_at TIMESTAMPTZ DEFAULT NOW(),
    is_override BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason TEXT,
    CONSTRAINT unique_hostel_bed UNIQUE (hostel_id, room_number, bed_number)
);

-- 6. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL CHECK (type IN ('auditorium', 'classroom', 'ground', 'amphitheatre', 'boardroom')),
    has_projector BOOLEAN NOT NULL DEFAULT TRUE,
    has_sound_system BOOLEAN NOT NULL DEFAULT TRUE,
    has_ac BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'compromised')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('flagship', 'cultural', 'management', 'sports', 'informal')),
    venue_id UUID REFERENCES venues(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    min_team_size INT NOT NULL DEFAULT 1,
    max_team_size INT NOT NULL DEFAULT 1,
    capacity_limit INT NOT NULL DEFAULT 100,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delayed', 'ongoing', 'completed', 'venue_shifted', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    contingent_id UUID NOT NULL REFERENCES contingents(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled'))
);

-- 9. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('catering', 'stage_sound', 'security', 'medical', 'waste_management', 'decor')),
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    hygiene_rating NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
    hygiene_cert_valid_until DATE NOT NULL,
    operating_hours VARCHAR(100) NOT NULL,
    compliance_status VARCHAR(50) NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'breached')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Inventory Logistics Table
CREATE TABLE IF NOT EXISTS inventory_logistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('av_equipment', 'furniture', 'barricades', 'power_generators', 'canopy')),
    total_quantity INT NOT NULL DEFAULT 0,
    in_use_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    condition VARCHAR(50) NOT NULL DEFAULT 'optimal' CHECK (condition IN ('optimal', 'needs_repair', 'damaged')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Inventory Merch Table
CREATE TABLE IF NOT EXISTS inventory_merch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    size VARCHAR(20) NOT NULL,
    total_stock INT NOT NULL DEFAULT 0,
    distributed_stock INT NOT NULL DEFAULT 0,
    remaining_stock INT NOT NULL DEFAULT 0,
    target_group VARCHAR(50) NOT NULL DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Core Team Table
CREATE TABLE IF NOT EXISTS core_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    walkie_channel VARCHAR(50) NOT NULL,
    shift_status VARCHAR(50) NOT NULL DEFAULT 'on_duty' CHECK (shift_status IN ('on_duty', 'off_duty', 'standby')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Overrides Audit Log Table
CREATE TABLE IF NOT EXISTS overrides_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    previous_state TEXT NOT NULL,
    new_state TEXT NOT NULL,
    approved_by VARCHAR(255) NOT NULL
);

-- Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE hostels;
ALTER PUBLICATION supabase_realtime ADD TABLE accommodation_allocations;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE overrides_audit_log;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE venues;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE contingents;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

