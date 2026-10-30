export type Gender = 'male' | 'female' | 'other';
export type DietaryRequirement = 'none' | 'veg' | 'jain' | 'vegan' | 'halal';
export type ContingentStatus = 'expected' | 'arrived' | 'delayed' | 'checked_out';
export type FacilityStatus = 'operational' | 'closed' | 'maintenance' | 'standby' | 'active' | 'full';
export type EventCategory = 'flagship' | 'cultural' | 'management' | 'sports' | 'informal' | 'solo' | 'team';
export type EventStatus = 'scheduled' | 'delayed' | 'ongoing' | 'completed' | 'venue_shifted' | 'cancelled';
export type VenueStatus = 'available' | 'occupied' | 'maintenance' | 'compromised';
export type VendorStatus = 'compliant' | 'warning' | 'breached';
export type ActionType =
  | 'accommodation_override'
  | 'hostel_closure'
  | 'venue_shift'
  | 'contingent_delay'
  | 'emergency_lockdown'
  | 'capacity_violation_override'
  | 'external_overflow_activated';

export interface Contingent {
  id: string;
  name: string;
  college: string;
  city: string;
  leader_name: string;
  leader_phone: string;
  leader_email: string;
  total_members: number;
  male_count: number;
  female_count: number;
  arrival_time: string;
  departure_time: string;
  status: ContingentStatus;
}

export interface Participant {
  id: string;
  contingent_id: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  dietary_requirements: DietaryRequirement;
  accessibility_needs: boolean;
  accessibility_note?: string;
  role: 'leader' | 'delegate' | 'performer' | 'sports';
  checked_in: boolean;
  checked_in_at?: string | null;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  gender_allowed: 'male' | 'female' | 'all';
  total_capacity: number;
  occupied_beds: number;
  status: 'operational' | 'closed' | 'maintenance';
  floor_count: number;
  has_elevator: boolean;
  notes?: string;
}

export interface ExternalStay {
  id: string;
  name: string;
  location: string;
  total_capacity: number;
  occupied_beds: number;
  cost_per_night: number;
  contact_person: string;
  contact_phone: string;
  status: 'standby' | 'active' | 'full';
}

export interface AccommodationAllocation {
  id: string;
  participant_id: string;
  hostel_id?: string | null;
  room_number: string;
  bed_number: string;
  external_stay_id?: string | null;
  status: 'allocated' | 'confirmed' | 'vacated';
  allocated_at: string;
  is_override?: boolean;
  override_reason?: string;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: 'auditorium' | 'classroom' | 'ground' | 'amphitheatre' | 'boardroom';
  has_projector: boolean;
  has_sound_system: boolean;
  has_ac: boolean;
  status: VenueStatus;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  venue_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  min_team_size: number;
  max_team_size: number;
  capacity_limit: number;
  status: EventStatus;
  registered_participants_count?: number;
  equipment_needed?: string[];
}

export interface Registration {
  id: string;
  event_id: string;
  contingent_id: string;
  participant_id: string;
  team_name?: string;
  registered_at: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled';
}

export interface Vendor {
  id: string;
  name: string;
  category: 'catering' | 'stage_sound' | 'security' | 'medical' | 'waste_management' | 'decor';
  contact_name: string;
  contact_phone: string;
  hygiene_rating: number; // 0 - 5.0
  hygiene_cert_valid_until: string;
  operating_hours: string;
  compliance_status: VendorStatus;
  notes?: string;
}

export interface InventoryLogistics {
  id: string;
  item_name: string;
  category: 'av_equipment' | 'furniture' | 'barricades' | 'power_generators' | 'canopy';
  total_quantity: number;
  in_use_quantity: number;
  available_quantity: number;
  location: string;
  condition: 'optimal' | 'needs_repair' | 'damaged';
}

export interface InventoryMerch {
  id: string;
  item_name: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';
  total_stock: number;
  distributed_stock: number;
  remaining_stock: number;
  target_group: 'all' | 'contingents' | 'judges' | 'core_team';
}

export interface CoreTeamMember {
  id: string;
  name: string;
  role: 'festival_director' | 'ops_head' | 'hospitality_lead' | 'events_lead' | 'logistics_lead' | 'security_chief';
  phone: string;
  walkie_channel: string;
  shift_status: 'on_duty' | 'off_duty' | 'standby';
}

export interface OverrideAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action_type: ActionType;
  entity_id: string;
  entity_type: 'hostel' | 'participant' | 'venue' | 'contingent' | 'allocation';
  reason: string;
  previous_state: string;
  new_state: string;
  approved_by: string;
}

export interface ClashAlert {
  id: string;
  type: 'venue_overlap' | 'participant_clash' | 'capacity_exceeded' | 'equipment_conflict';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  eventIds: string[];
  venueId?: string;
  participantId?: string;
}

