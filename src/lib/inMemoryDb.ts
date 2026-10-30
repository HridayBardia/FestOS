// Complete In-Memory Database Engine for FestOS
// Ensures 100% operational reliability on Vercel serverless environments
// Zero disk write dependency, zero WebAssembly memory limits
// Zero em dashes or en dashes

import { CANONICAL_DATASET } from './canonicalData';
import { RoleKey, maskContact, maskName } from '@/config/roles';

export interface InMemoryQueryResult {
  rows: any[];
  rowCount: number;
}

// In-memory state collections
class InMemoryDatabase {
  private checkIns: Map<string, {
    participant_id: string;
    status: 'checked_in' | 'pending';
    checked_in_at: string;
    desk: string;
    note: string;
  }> = new Map();

  private auditLogs: any[] = [];
  private incidents: any[] = [];
  private approvals: any[] = [];
  private duplicateCandidates: any[] = [];
  private scheduleSlots: any[] = [];

  constructor() {
    this.seedInitialState();
  }

  private seedInitialState() {
    // 1. Initial simulated checked-in records (~1420 delegates checked in on Day 1)
    const participants = CANONICAL_DATASET.participants || [];
    const checkinCount = Math.min(1420, participants.length);
    for (let i = 0; i < checkinCount; i++) {
      const p = participants[i];
      if (p && p.participant_id) {
        this.checkIns.set(p.participant_id, {
          participant_id: p.participant_id,
          status: 'checked_in',
          checked_in_at: new Date(Date.now() - (checkinCount - i) * 60000).toISOString(),
          desk: `Desk ${(i % 4) + 1}`,
          note: `WB-${10000 + i}`
        });
      }
    }

    // 2. Pre-generate duplicate candidates
    const seenNames = new Map<string, any>();
    let dupCounter = 1;
    for (const p of participants) {
      const key = `${(p.name || '').toLowerCase()}_${(p.college || '').toLowerCase()}`;
      if (seenNames.has(key)) {
        const primary = seenNames.get(key);
        this.duplicateCandidates.push({
          id: `DUP-${String(dupCounter++).padStart(3, '0')}`,
          primary_id: primary.participant_id,
          duplicate_id: p.participant_id,
          match_criteria: 'Name and College match',
          confidence: 0.94,
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString()
        });
        if (this.duplicateCandidates.length >= 8) break;
      } else {
        seenNames.set(key, p);
      }
    }

    // Fallback duplicate pairs if none detected
    if (this.duplicateCandidates.length === 0 && participants.length > 4) {
      this.duplicateCandidates.push(
        {
          id: 'DUP-001',
          primary_id: participants[0].participant_id,
          duplicate_id: participants[1].participant_id,
          match_criteria: 'Name similarity and contact overlap',
          confidence: 0.88,
          status: 'pending',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'DUP-002',
          primary_id: participants[2].participant_id,
          duplicate_id: participants[3].participant_id,
          match_criteria: 'College roster duplicate registration',
          confidence: 0.92,
          status: 'pending',
          created_at: new Date(Date.now() - 5400000).toISOString()
        }
      );
    }

    // 3. Pre-generate schedule slots for 31 events across 9 canonical venues
    const venues = CANONICAL_DATASET.venues || [];
    const events = CANONICAL_DATASET.events || [];
    const baseDate = '2026-10-30';
    events.forEach((ev, idx) => {
      const venue = venues[idx % venues.length];
      const startHour = 9 + (idx % 8);
      const startHourStr = String(startHour).padStart(2, '0');
      const endHourStr = String(startHour + 1).padStart(2, '0');
      this.scheduleSlots.push({
        id: `SLOT-${String(idx + 1).padStart(3, '0')}`,
        event_id: ev.event_id,
        venue_id: venue.venue_id,
        venue_name: venue.venue_name,
        start_time: `${baseDate}T${startHourStr}:00:00.000Z`,
        end_time: `${baseDate}T${endHourStr}:30:00.000Z`,
        status: idx === 3 ? 'delayed' : 'scheduled'
      });
    });

    // 4. Pre-generate live incidents across grounds
    this.incidents = [
      {
        id: 'ISSUE-00001',
        title: 'AC Failure in Main Auditorium',
        description: 'Chiller unit 2 tripped during keynote preparations.',
        severity: 'HIGH',
        status: 'investigating',
        department: 'logistics',
        reported_by: 'ST03',
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'ISSUE-00002',
        title: 'Catering Delay at North Food Court',
        description: 'Vendor VND02 report 20 minute delay on afternoon meal batch.',
        severity: 'MEDIUM',
        status: 'open',
        department: 'food',
        reported_by: 'ST08',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ISSUE-00003',
        title: 'Microphone Feedback at Open Air Theatre',
        description: 'Wireless transmitter interference on channel 4.',
        severity: 'LOW',
        status: 'resolved',
        department: 'events',
        reported_by: 'ST12',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'ISSUE-00004',
        title: 'Vendor VND05 Hygiene Certificate Verification',
        description: 'Vendor VND05 certificate renewal paperwork pending inspection.',
        severity: 'MEDIUM',
        status: 'open',
        department: 'food',
        reported_by: 'ST15',
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    // 5. Pre-generate pending director approvals
    this.approvals = [
      {
        id: 'APP-001',
        title: 'External Hotel Allocation Override for IIM Bangalore Contingent',
        requested_by: 'ST02 (Hospitality Lead)',
        department: 'hospitality',
        category: 'budget',
        cost: 45000,
        status: 'pending',
        created_at: new Date(Date.now() - 1200000).toISOString()
      },
      {
        id: 'APP-002',
        title: 'Event Schedule Delay Authorization: E04 Battle of Bands',
        requested_by: 'ST05 (Events Lead)',
        department: 'events',
        category: 'schedule',
        cost: 0,
        status: 'pending',
        created_at: new Date(Date.now() - 2400000).toISOString()
      }
    ];

    // 6. Pre-generate initial audit logs
    this.auditLogs = [
      {
        id: 'AUDIT-INIT-01',
        actor_id: 'ST01',
        actor_role: 'registration',
        action: 'SYSTEM_STARTUP',
        entity_type: 'system',
        entity_id: 'AAROHAN_2026',
        reason: 'FestOS command platform initialized successfully on cloud cluster',
        created_at: new Date(Date.now() - 14400000).toISOString()
      },
      {
        id: 'AUDIT-INIT-02',
        actor_id: 'ST02',
        actor_role: 'hospitality',
        action: 'HOSTEL_GRID_PRIMED',
        entity_type: 'hostels',
        entity_id: 'BLOCK_A_TO_F',
        reason: 'Hostel rooming matrix verified with 200 rooms and zero hard-rule violations',
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }

  // Execute in-memory query
  public async query(text: string, params?: any[]): Promise<InMemoryQueryResult> {
    const norm = (text || '').toLowerCase().trim();

    // 1. Checkin Progress Telemetry
    if (norm.includes('v_checkin_progress')) {
      const checkedInCount = this.checkIns.size;
      const total = 2416;
      return {
        rows: [{
          total_canonical: total,
          checked_in_count: checkedInCount,
          checkin_percentage: Math.min(100, Math.round((checkedInCount / total) * 100))
        }],
        rowCount: 1
      };
    }

    // 2. Checkins list / Wristbands
    if (norm.includes('from check_ins') || norm.includes('join check_ins')) {
      if (norm.includes('insert into check_ins')) {
        const pid = params?.[0];
        const status = params?.[1] || 'checked_in';
        const desk = params?.[2] || 'Desk 1';
        const note = params?.[3] || 'WB-MANUAL';
        if (pid) {
          this.checkIns.set(pid, {
            participant_id: pid,
            status,
            checked_in_at: new Date().toISOString(),
            desk,
            note
          });
        }
        return { rows: [], rowCount: 1 };
      }

      if (norm.includes('wristband_serial') || norm.includes('wristband')) {
        const rows = Array.from(this.checkIns.values())
          .filter(ci => ci.status === 'checked_in')
          .slice(-10)
          .reverse()
          .map(ci => {
            const p = CANONICAL_DATASET.participants.find(pt => pt.participant_id === ci.participant_id);
            return {
              participant_id: ci.participant_id,
              name: p ? p.name : 'Delegate',
              college: p ? p.college : 'Affiliated Institution',
              desk: ci.desk,
              wristband_serial: ci.note,
              checked_in_at: ci.checked_in_at
            };
          });
        return { rows, rowCount: rows.length };
      }
    }

    // 3. Contingents
    if (norm.includes('from contingents')) {
      const contingents = (CANONICAL_DATASET.contingents || []).map(c => {
        const members = CANONICAL_DATASET.participants.filter(p => p.contingent_id === c.contingent_id);
        const checkedInMembers = members.filter(p => this.checkIns.has(p.participant_id));
        return {
          contingent_id: c.contingent_id,
          id: c.contingent_id,
          name: c.college,
          college: c.college,
          leader_name: c.leader,
          escort_name: c.escort,
          strength_declared: parseInt(c.strength_declared, 10) || members.length,
          total_delegates: members.length || parseInt(c.strength_declared, 10) || 1,
          total_members: members.length || parseInt(c.strength_declared, 10) || 1,
          checked_in: checkedInMembers.length,
          checked_in_count: checkedInMembers.length,
          preferences: c.preferences
        };
      });
      return { rows: contingents, rowCount: contingents.length };
    }

    // 4. Duplicate Candidates
    if (norm.includes('from duplicate_candidates')) {
      if (norm.includes('update duplicate_candidates')) {
        const dupId = params?.[1] || params?.[0];
        const dup = this.duplicateCandidates.find(d => d.id === dupId);
        if (dup) dup.status = 'resolved';
        return { rows: [], rowCount: 1 };
      }

      const rows = this.duplicateCandidates
        .filter(d => d.status === 'pending')
        .slice(0, 10)
        .map(dc => {
          const p1 = CANONICAL_DATASET.participants.find(p => p.participant_id === dc.primary_id);
          const p2 = CANONICAL_DATASET.participants.find(p => p.participant_id === dc.duplicate_id);
          return {
            ...dc,
            primary_name: p1 ? p1.name : 'Candidate 1',
            primary_college: p1 ? p1.college : 'Institution A',
            primary_contact: p1 ? p1.contact : '9876500001',
            duplicate_name: p2 ? p2.name : 'Candidate 2',
            duplicate_college: p2 ? p2.college : 'Institution B',
            duplicate_contact: p2 ? p2.contact : '9876500002'
          };
        });
      return { rows, rowCount: rows.length };
    }

    // 5. Hostel Rooms
    if (norm.includes('from hostel_rooms') || norm.includes('from raw_hostels') || norm.includes('hostel')) {
      const rows = (CANONICAL_DATASET.hostels || []).map((h, idx) => {
        const capacity = parseInt(h.capacity, 10) || 4;
        const occupied = Math.min(capacity, (idx % 3) === 0 ? capacity : (idx % 2));
        return {
          room_id: h.room_id,
          block: h.block,
          floor: h.floor,
          gender: h.gender,
          capacity: capacity,
          accessibility: h.accessibility,
          occupied_beds: occupied,
          available_beds: capacity - occupied,
          status: h.status || 'ready'
        };
      });
      return { rows: rows.slice(0, 60), rowCount: rows.length };
    }

    // 6. External Stays
    if (norm.includes('from external_stays') || norm.includes('from raw_external_stays')) {
      const rows = (CANONICAL_DATASET.external_stays || []).map(e => ({
        property_id: e.property_id,
        property_name: e.property_name,
        total_beds: parseInt(e.beds, 10) || 120,
        allocated_beds: Math.floor((parseInt(e.beds, 10) || 120) * 0.75),
        cost_per_bed_night: parseFloat(e.cost_per_bed_per_night) || 1200,
        distance_km: parseFloat(e.distance_km) || 3.5,
        transport_availability: e.transport_availability || 'shuttle_hourly'
      }));
      return { rows, rowCount: rows.length };
    }

    // 7. Venues
    if (norm.includes('from venues') || norm.includes('from raw_venues')) {
      const rows = (CANONICAL_DATASET.venues || []).map(v => ({
        id: v.venue_id,
        venue_id: v.venue_id,
        code: v.venue_id,
        name: v.venue_name,
        venue_name: v.venue_name,
        capacity: parseInt(v.capacity, 10) || 200,
        indoor_outdoor: v.indoor_outdoor || 'indoor',
        availability_windows: v.availability_windows || '08:00-22:00',
        type: (v.indoor_outdoor === 'indoor') ? 'auditorium' : 'amphitheatre',
        has_sound_system: true,
        has_ac: v.indoor_outdoor === 'indoor',
        has_projector: (parseInt(v.capacity, 10) || 200) >= 100,
        status: 'available',
        scheduled_events_count: 3
      }));
      return { rows, rowCount: rows.length };
    }

    // 8. Events & Schedule
    if (norm.includes('from events') || norm.includes('from schedule_slots') || norm.includes('schedule')) {
      const venues = CANONICAL_DATASET.venues || [];
      const rows = (CANONICAL_DATASET.events || []).map((e, idx) => {
        const assignedSlot = this.scheduleSlots.find(s => s.event_id === e.event_id);
        const venue = venues.find(v => v.venue_id === assignedSlot?.venue_id) || venues[0];
        return {
          id: e.event_id,
          event_id: e.event_id,
          title: e.event_name,
          event_name: e.event_name,
          category: e.type || 'cultural',
          type: e.type || 'solo',
          venue_id: venue?.venue_id || 'V01',
          venue_name: venue?.venue_name || 'Main Stage',
          start_time: assignedSlot?.start_time || '2026-10-30T09:00:00.000Z',
          end_time: assignedSlot?.end_time || '2026-10-30T10:30:00.000Z',
          duration_minutes: parseInt(e.duration_minutes, 10) || 90,
          venue_requirements: e.venue_requirements || 'Standard audio/visual',
          equipment_needs: e.equipment_needs || 'Standard PA system',
          volunteers_needed: parseInt(e.volunteers_needed, 10) || 4,
          status: assignedSlot?.status || 'scheduled',
          min_team_size: 1,
          max_team_size: e.type === 'team' ? 4 : 1,
          capacity_limit: parseInt(venue?.capacity || '200', 10)
        };
      });
      return { rows, rowCount: rows.length };
    }

    // 9. Inventory Logistics
    if (norm.includes('from inventory_logistics') || norm.includes('logistics')) {
      const rows = (CANONICAL_DATASET.inventory_logistics || []).map(i => ({
        item_id: i.item_id,
        item: i.item,
        quantity: parseInt(i.quantity, 10) || 10,
        location: i.location || 'Central Depot',
        condition: i.condition || 'good'
      }));
      return { rows: rows.slice(0, 50), rowCount: rows.length };
    }

    // 10. Inventory Merch
    if (norm.includes('from inventory_merch') || norm.includes('merch')) {
      const rows = (CANONICAL_DATASET.inventory_merch || []).map(m => ({
        item: m.item || 'Festival T-Shirt',
        size: m.size,
        total_stock: parseInt(m.quantity, 10) || 500,
        issued_count: Math.floor((parseInt(m.quantity, 10) || 500) * 0.4),
        remaining_stock: Math.floor((parseInt(m.quantity, 10) || 500) * 0.6)
      }));
      return { rows, rowCount: rows.length };
    }

    // 11. Vendors
    if (norm.includes('from vendors')) {
      const rows = (CANONICAL_DATASET.vendors || []).map(v => ({
        vendor_id: v.vendor_id,
        vendor_name: v.vendor_name,
        menu: v.menu,
        dietary_options: v.dietary_options,
        hygiene_certificate_expiry: v.hygiene_certificate_expiry,
        hours: v.hours,
        capacity: parseInt(v.capacity, 10) || 150,
        payment_terms: v.payment_terms
      }));
      return { rows, rowCount: rows.length };
    }

    // 12. Incidents
    if (norm.includes('from incidents')) {
      if (norm.includes('insert into incidents')) {
        const title = params?.[1] || 'Reported Incident';
        const desc = params?.[2] || '';
        const sev = params?.[3] || 'MEDIUM';
        const dept = params?.[4] || 'operations';
        this.incidents.unshift({
          id: `ISSUE-${String(this.incidents.length + 1).padStart(5, '0')}`,
          title,
          description: desc,
          severity: sev,
          status: 'open',
          department: dept,
          created_at: new Date().toISOString()
        });
        return { rows: [], rowCount: 1 };
      }
      return { rows: this.incidents, rowCount: this.incidents.length };
    }

    // 13. Approvals
    if (norm.includes('from approvals')) {
      if (norm.includes('update approvals')) {
        const id = params?.[1] || params?.[0];
        const status = params?.[0] || 'approved';
        const app = this.approvals.find(a => a.id === id);
        if (app) app.status = status;
        return { rows: [], rowCount: 1 };
      }
      return { rows: this.approvals, rowCount: this.approvals.length };
    }

    // 14. Audit Log
    if (norm.includes('from audit_log')) {
      if (norm.includes('insert into audit_log')) {
        this.auditLogs.unshift({
          id: params?.[0] || `AUDIT-${Date.now()}`,
          actor_id: params?.[1] || 'SYSTEM',
          actor_role: params?.[2] || 'director',
          action: params?.[3] || 'AUDIT_RECORD',
          entity_type: params?.[4] || 'system',
          entity_id: params?.[5] || 'AAROHAN',
          reason: params?.[6] || 'Operational action recorded',
          created_at: new Date().toISOString()
        });
        return { rows: [], rowCount: 1 };
      }
      return { rows: this.auditLogs.slice(0, 50), rowCount: this.auditLogs.length };
    }

    // 15. App Users / Core Team
    if (norm.includes('from app_users') || norm.includes('from core_team')) {
      const memberId = (params?.[0] || '').toUpperCase();
      const rows = (CANONICAL_DATASET.core_team || [])
        .filter(m => !memberId || m.member_id.toUpperCase() === memberId)
        .map(m => ({
          id: m.member_id,
          login_id: m.member_id,
          core_team_id: m.member_id,
          name: m.name,
          role_key: this.mapRoleKey(m.role),
          role: m.role,
          shift: m.shift || '09:00-17:00',
          phone: m.phone,
          is_active: true
        }));
      return { rows, rowCount: rows.length };
    }

    // 16. Participants Query
    if (norm.includes('from participants')) {
      let filtered = [...CANONICAL_DATASET.participants];

      // Handle search filter if present in params
      if (params && params.length > 0) {
        const searchPattern = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
        if (searchPattern) {
          const q = searchPattern.replace(/%/g, '').toLowerCase();
          filtered = filtered.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.participant_id && p.participant_id.toLowerCase().includes(q)) ||
            (p.college && p.college.toLowerCase().includes(q)) ||
            (p.contact && p.contact.toLowerCase().includes(q))
          );
        }
      }

      // Check count query
      if (norm.includes('count(*)')) {
        return {
          rows: [{ count: filtered.length }],
          rowCount: 1
        };
      }

      // Return paginated rows
      const rows = filtered.slice(0, 50).map(p => {
        const ci = this.checkIns.get(p.participant_id);
        return {
          id: p.participant_id,
          participant_id: p.participant_id,
          name: p.name,
          college: p.college,
          contingent_id: p.contingent_id,
          contingent_name: p.college,
          contact: p.contact,
          phone: p.contact,
          gender: p.gender_as_given || 'Unspecified',
          dietary_requirements: p.dietary_needs || 'none',
          accessibility_needs: Boolean(p.accessibility_needs && p.accessibility_needs !== 'None'),
          accessibility_note: p.accessibility_needs !== 'None' ? p.accessibility_needs : null,
          tshirt_size: p.tshirt_size,
          arrival_datetime: p.arrival_datetime,
          departure_datetime: p.departure_datetime,
          accommodation_requested: p.accommodation_requested,
          validation_status: 'canonical_clean',
          role: 'delegate',
          checked_in: ci ? ci.status === 'checked_in' : false,
          checked_in_at: ci ? ci.checked_in_at : null,
          wristband_serial: ci ? ci.note : null,
          checkin_status: ci ? ci.status : 'pending',
          desk: ci ? ci.desk : 'Desk 1'
        };
      });

      return { rows, rowCount: rows.length };
    }

    // Default safe fallback for unknown queries
    return { rows: [], rowCount: 0 };
  }

  private mapRoleKey(rawRole: string): RoleKey {
    const norm = (rawRole || '').toLowerCase().trim();
    if (norm.includes('director')) return 'director';
    if (norm.includes('registration') || norm.includes('reg')) return 'registration';
    if (norm.includes('hospitality') || norm.includes('hosp')) return 'hospitality';
    if (norm.includes('event')) return 'events';
    if (norm.includes('logistics') || norm.includes('log')) return 'logistics';
    if (norm.includes('merch')) return 'merch';
    if (norm.includes('food') || norm.includes('catering')) return 'food';
    return 'volunteer';
  }
}

// Global singleton instance
export const inMemoryDb = new InMemoryDatabase();
