'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  ClashAlert,
  ActionType
} from '../types/database';
import {
  INITIAL_CONTINGENTS,
  INITIAL_HOSTELS,
  INITIAL_EXTERNAL_STAYS,
  INITIAL_PARTICIPANTS,
  INITIAL_ALLOCATIONS,
  INITIAL_VENUES,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_VENDORS,
  INITIAL_LOGISTICS,
  INITIAL_MERCH,
  INITIAL_CORE_TEAM,
  INITIAL_AUDIT_LOGS
} from '../lib/mockData';
import { getSupabaseClient, isSupabaseConfigured, saveCredentials, getStoredCredentials } from '../lib/supabase';
import { formatISTTimeWithSeconds } from '../lib/formatters';

interface FestContextType {
  contingents: Contingent[];
  participants: Participant[];
  hostels: Hostel[];
  externalStays: ExternalStay[];
  allocations: AccommodationAllocation[];
  venues: Venue[];
  events: EventItem[];
  registrations: Registration[];
  vendors: Vendor[];
  logistics: InventoryLogistics[];
  merch: InventoryMerch[];
  coreTeam: CoreTeamMember[];
  auditLogs: OverrideAuditLog[];
  clashes: ClashAlert[];
  
  participantsCount: number;
  checkedInCount: number;
  auditCount: number;
  contingentsCount: number;

  isLiveConnected: boolean;
  isUsingRemoteSupabase: boolean;
  lastSyncTime: string;
  activeDisruptions: string[];
  
  allocateRoom: (
    participantId: string,
    hostelId: string,
    roomNumber: string,
    bedNumber: string,
    isOverride?: boolean,
    overrideReason?: string,
    approvedBy?: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  allocateExternalStay: (
    participantId: string,
    externalStayId: string,
    roomNumber: string,
    bedNumber: string,
    reason: string,
    approvedBy: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  deallocateParticipant: (participantId: string, reason?: string) => Promise<void>;
  toggleCheckIn: (participantId: string) => Promise<void>;
  updateEventVenue: (eventId: string, newVenueId: string, reason: string, approvedBy: string) => Promise<void>;
  updateEventTime: (eventId: string, newStartTime: string, newEndTime: string, reason: string) => Promise<void>;
  updateHostelStatus: (hostelId: string, status: 'operational' | 'closed' | 'maintenance', reason: string) => Promise<void>;
  updateVendorStatus: (vendorId: string, status: 'compliant' | 'warning' | 'breached', notes?: string) => Promise<void>;
  injectDisruption: (type: string, payload: any, reason: string, approvedBy: string) => Promise<void>;
  resolveDisruption: (disruptionId: string) => Promise<void>;
  autoAllocateAll: () => { allocatedCount: number; violationsCount: number };
  refreshData: () => Promise<void>;
  connectSupabase: (url: string, key: string) => Promise<boolean>;
  
  fetchParticipantsPage: (params: {
    page: number;
    pageSize: number;
    search?: string;
    contingentId?: string;
    dietary?: string;
    accessibility?: boolean;
    checkedIn?: string;
  }) => Promise<{ data: Participant[]; totalCount: number }>;
}

const FestContext = createContext<FestContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = 'festos_aarohan_luxury_sync';

export const FestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contingents, setContingents] = useState<Contingent[]>(INITIAL_CONTINGENTS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [hostels, setHostels] = useState<Hostel[]>(INITIAL_HOSTELS);
  const [externalStays, setExternalStays] = useState<ExternalStay[]>(INITIAL_EXTERNAL_STAYS);
  const [allocations, setAllocations] = useState<AccommodationAllocation[]>(INITIAL_ALLOCATIONS);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [logistics, setLogistics] = useState<InventoryLogistics[]>(INITIAL_LOGISTICS);
  const [merch, setMerch] = useState<InventoryMerch[]>(INITIAL_MERCH);
  const [coreTeam, setCoreTeam] = useState<CoreTeamMember[]>(INITIAL_CORE_TEAM);
  const [auditLogs, setAuditLogs] = useState<OverrideAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeDisruptions, setActiveDisruptions] = useState<string[]>([]);
  
  const [participantsCount, setParticipantsCount] = useState<number>(2836);
  const [checkedInCount, setCheckedInCount] = useState<number>(1420);
  const [auditCount, setAuditCount] = useState<number>(INITIAL_AUDIT_LOGS.length);
  const [contingentsCount, setContingentsCount] = useState<number>(INITIAL_CONTINGENTS.length);

  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isUsingRemoteSupabase, setIsUsingRemoteSupabase] = useState<boolean>(false);
  
  // Deterministic initial value to prevent SSR/Hydration mismatch
  const [lastSyncTime, setLastSyncTime] = useState<string>('11:32:00 AM');

  const broadcastRef = React.useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastRef.current = bc;

      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'STATE_MUTATION') {
          if (payload.contingents) setContingents(payload.contingents);
          if (payload.participants) setParticipants(payload.participants);
          if (payload.hostels) setHostels(payload.hostels);
          if (payload.externalStays) setExternalStays(payload.externalStays);
          if (payload.allocations) setAllocations(payload.allocations);
          if (payload.venues) setVenues(payload.venues);
          if (payload.events) setEvents(payload.events);
          if (payload.vendors) setVendors(payload.vendors);
          if (payload.auditLogs) setAuditLogs(payload.auditLogs);
          if (payload.activeDisruptions) setActiveDisruptions(payload.activeDisruptions);
          if (payload.participantsCount !== undefined) setParticipantsCount(payload.participantsCount);
          if (payload.checkedInCount !== undefined) setCheckedInCount(payload.checkedInCount);
          if (payload.auditCount !== undefined) setAuditCount(payload.auditCount);
          setLastSyncTime(formatISTTimeWithSeconds(new Date().toISOString()));
        }
      };

      return () => {
        bc.close();
      };
    }
  }, []);

  const broadcastStateUpdate = useCallback((partial: any) => {
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type: 'STATE_MUTATION',
        payload: partial,
      });
    }
  }, []);

  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      setIsUsingRemoteSupabase(false);
      setIsLiveConnected(true);

      // Local API telemetry sync (reads from PGlite database)
      try {
        const [contingentsRes, kpiRes] = await Promise.all([
          fetch('/api/participants?type=contingents').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/widgets/data?widgetId=master_kpi_bar&role=director').then((r) =>
            r.ok ? r.json() : null
          ),
        ]);

        if (contingentsRes && contingentsRes.success && Array.isArray(contingentsRes.data)) {
          const mappedContingents: Contingent[] = contingentsRes.data.map((c: any) => ({
            id: c.id,
            name: c.name || c.college,
            college: c.college,
            city: c.college ? c.college.split(' ')[0] : 'Indore',
            leader_name: c.leader_name || 'N/A',
            escort_name: c.escort_name || 'N/A',
            total_members: Number(c.total_members) || 0,
            checked_in_members: Number(c.checked_in_count) || 0,
            rooms_allocated: Math.ceil((Number(c.total_members) || 1) / 2),
            status: Number(c.checked_in_count) > 0 ? 'arrived' : 'expected',
            preferences: c.preferences || '',
          }));
          setContingents(mappedContingents);
          setContingentsCount(mappedContingents.length);
        }

        if (kpiRes && kpiRes.success && kpiRes.data) {
          if (kpiRes.data.totalRegistered) setParticipantsCount(kpiRes.data.totalRegistered);
          if (kpiRes.data.checkedIn !== undefined) setCheckedInCount(kpiRes.data.checkedIn);
        }

        setLastSyncTime(formatISTTimeWithSeconds(new Date().toISOString()));
      } catch (err) {
        console.warn('FestOS local telemetry sync fallback:', err);
      }
      return;
    }

    try {
      setIsUsingRemoteSupabase(true);
      setIsLiveConnected(true);

      const [
        pCountRes,
        pCheckedInRes,
        cCountRes,
        auditCountRes,
        hostelsRes,
        extStaysRes,
        contingentsRes,
        eventsRes,
        venuesRes,
        vendorsRes,
        allocsRes,
        auditLogsRes,
      ] = await Promise.all([
        supabase.from('participants').select('*', { count: 'exact', head: true }),
        supabase.from('participants').select('*', { count: 'exact', head: true }).eq('checked_in', true),
        supabase.from('contingents').select('*', { count: 'exact', head: true }),
        supabase.from('overrides_audit_log').select('*', { count: 'exact', head: true }),
        supabase.from('hostels').select('*'),
        supabase.from('external_stays').select('*'),
        supabase.from('contingents').select('*'),
        supabase.from('events').select('*'),
        supabase.from('venues').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('accommodation_allocations').select('*'),
        supabase.from('overrides_audit_log').select('*').order('timestamp', { ascending: false }).limit(50),
      ]);

      if (pCountRes.count !== null && pCountRes.count !== undefined) {
        setParticipantsCount(pCountRes.count);
      }
      if (pCheckedInRes.count !== null && pCheckedInRes.count !== undefined) {
        setCheckedInCount(pCheckedInRes.count);
      }
      if (cCountRes.count !== null && cCountRes.count !== undefined) {
        setContingentsCount(cCountRes.count);
      }
      if (auditCountRes.count !== null && auditCountRes.count !== undefined) {
        setAuditCount(auditCountRes.count);
      }

      if (hostelsRes.data && hostelsRes.data.length > 0) setHostels(hostelsRes.data);
      if (extStaysRes.data && extStaysRes.data.length > 0) setExternalStays(extStaysRes.data);
      if (contingentsRes.data && contingentsRes.data.length > 0) setContingents(contingentsRes.data);
      if (eventsRes.data && eventsRes.data.length > 0) setEvents(eventsRes.data);
      if (venuesRes.data && venuesRes.data.length > 0) setVenues(venuesRes.data);
      if (vendorsRes.data && vendorsRes.data.length > 0) setVendors(vendorsRes.data);
      if (allocsRes.data && allocsRes.data.length > 0) setAllocations(allocsRes.data);
      if (auditLogsRes.data && auditLogsRes.data.length > 0) setAuditLogs(auditLogsRes.data);

      setLastSyncTime(formatISTTimeWithSeconds(new Date().toISOString()));
    } catch (err) {
      console.warn('FestOS live Supabase query fallback:', err);
    }
  }, []);

  const connectSupabase = useCallback(async (url: string, key: string) => {
    try {
      saveCredentials(url, key);
      const client = getSupabaseClient();
      if (!client) return false;
      const { error } = await client.from('participants').select('*', { count: 'exact', head: true });
      if (error) {
        console.warn('Supabase test ping error:', error);
      }
      await refreshData();
      return true;
    } catch (e) {
      console.error('Error connecting to Supabase:', e);
      return false;
    }
  }, [refreshData]);

  useEffect(() => {
    refreshData();

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const channel = supabase
        .channel('festos-luxury-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hostels' }, () => refreshData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accommodation_allocations' }, () => refreshData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => refreshData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'overrides_audit_log' }, () => refreshData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => refreshData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => refreshData())
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsLiveConnected(true);
            setIsUsingRemoteSupabase(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setIsLiveConnected(true);
    }
  }, [refreshData]);

  const fetchParticipantsPage = useCallback(async ({
    page,
    pageSize,
    search = '',
    contingentId = 'all',
    dietary = 'all',
    accessibility = false,
    checkedIn = 'all',
  }: {
    page: number;
    pageSize: number;
    search?: string;
    contingentId?: string;
    dietary?: string;
    accessibility?: boolean;
    checkedIn?: string;
  }) => {
    // 1. Primary: Query the real database (PGlite) via /api/participants
    try {
      const qParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: search.trim(),
        contingentId,
        dietary,
        accessibility: accessibility ? 'true' : 'false',
        checkedIn,
      });

      const res = await fetch(`/api/participants?${qParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return { data: json.data, totalCount: json.totalCount };
        }
      }
    } catch (e) {
      console.warn('API participants query fallback:', e);
    }

    // 2. Secondary fallback: Cloud Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('participants').select('*', { count: 'exact' });

        if (search.trim()) {
          query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`);
        }
        if (contingentId !== 'all') {
          query = query.eq('contingent_id', contingentId);
        }
        if (dietary !== 'all') {
          query = query.eq('dietary_requirements', dietary);
        }
        if (accessibility) {
          query = query.eq('accessibility_needs', true);
        }
        if (checkedIn === 'checked_in') {
          query = query.eq('checked_in', true);
        } else if (checkedIn === 'pending') {
          query = query.eq('checked_in', false);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, count, error } = await query.range(from, to).order('name', { ascending: true });

        if (!error && data) {
          return { data, totalCount: count || data.length };
        }
      } catch (e) {
        console.warn('Supabase paginated query fallback:', e);
      }
    }

    const filtered = participants.filter((p) => {
      const cnt = contingents.find((c) => c.id === p.contingent_id);
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        cnt?.name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (contingentId !== 'all' && p.contingent_id !== contingentId) return false;
      if (dietary !== 'all' && p.dietary_requirements !== dietary) return false;
      if (accessibility && !p.accessibility_needs) return false;
      if (checkedIn === 'checked_in' && !p.checked_in) return false;
      if (checkedIn === 'pending' && p.checked_in) return false;

      return true;
    });

    const from = (page - 1) * pageSize;
    const paginated = filtered.slice(from, from + pageSize);
    return { data: paginated, totalCount: filtered.length };
  }, [participants, contingents]);

  const clashes = useMemo<ClashAlert[]>(() => {
    const foundClashes: ClashAlert[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        if (e1.venue_id === e2.venue_id && e1.status !== 'cancelled' && e2.status !== 'cancelled') {
          const start1 = new Date(e1.start_time).getTime();
          const end1 = new Date(e1.end_time).getTime();
          const start2 = new Date(e2.start_time).getTime();
          const end2 = new Date(e2.end_time).getTime();

          if (start1 < end2 && start2 < end1) {
            const venue = venues.find((v) => v.id === e1.venue_id);
            foundClashes.push({
              id: `clash-venue-${e1.id}-${e2.id}`,
              type: 'venue_overlap',
              severity: 'critical',
              title: `Venue Conflict: ${venue?.name || 'Venue'}`,
              description: `"${e1.title}" and "${e2.title}" both scheduled at ${venue?.name || 'same venue'} during overlapping hours.`,
              eventIds: [e1.id, e2.id],
              venueId: e1.venue_id,
            });
          }
        }
      }
    }

    const registrationsByParticipant: { [pId: string]: Registration[] } = {};
    registrations.forEach((reg) => {
      if (reg.status !== 'cancelled') {
        if (!registrationsByParticipant[reg.participant_id]) {
          registrationsByParticipant[reg.participant_id] = [];
        }
        registrationsByParticipant[reg.participant_id].push(reg);
      }
    });

    Object.entries(registrationsByParticipant).forEach(([pId, regs]) => {
      if (regs.length > 1) {
        for (let i = 0; i < regs.length; i++) {
          for (let j = i + 1; j < regs.length; j++) {
            const ev1 = events.find((e) => e.id === regs[i].event_id);
            const ev2 = events.find((e) => e.id === regs[j].event_id);
            if (ev1 && ev2 && ev1.status !== 'cancelled' && ev2.status !== 'cancelled') {
              const start1 = new Date(ev1.start_time).getTime();
              const end1 = new Date(ev1.end_time).getTime();
              const start2 = new Date(ev2.start_time).getTime();
              const end2 = new Date(ev2.end_time).getTime();

              if (start1 < end2 && start2 < end1) {
                const participant = participants.find((p) => p.id === pId);
                foundClashes.push({
                  id: `clash-part-${pId}-${ev1.id}-${ev2.id}`,
                  type: 'participant_clash',
                  severity: 'high',
                  title: `Participant Overlap: ${participant?.name || 'Delegate'}`,
                  description: `${participant?.name || 'Delegate'} is registered for "${ev1.title}" and "${ev2.title}" concurrently.`,
                  eventIds: [ev1.id, ev2.id],
                  participantId: pId,
                });
              }
            }
          }
        }
      }
    });

    events.forEach((ev) => {
      const venue = venues.find((v) => v.id === ev.venue_id);
      if (venue && (ev.registered_participants_count || 0) > venue.capacity) {
        foundClashes.push({
          id: `clash-cap-${ev.id}-${venue.id}`,
          type: 'capacity_exceeded',
          severity: 'high',
          title: `Capacity Exceeded: ${venue.name}`,
          description: `Event "${ev.title}" has ${ev.registered_participants_count} registrations exceeding ${venue.name} capacity of ${venue.capacity}.`,
          eventIds: [ev.id],
          venueId: venue.id,
        });
      }
    });

    return foundClashes;
  }, [events, venues, registrations, participants]);

  const logAudit = useCallback(async (
    actionType: ActionType,
    entityId: string,
    entityType: 'hostel' | 'participant' | 'venue' | 'contingent' | 'allocation',
    reason: string,
    prevState: string,
    newState: string,
    approvedBy: string
  ) => {
    const newLog: OverrideAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor: approvedBy || 'Festival Ops Command',
      action_type: actionType,
      entity_id: entityId,
      entity_type: entityType,
      reason,
      previous_state: prevState,
      new_state: newState,
      approved_by: approvedBy || 'Organizing Directorate'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setAuditCount((prev) => prev + 1);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('overrides_audit_log').insert(newLog);
      } catch (e) {
        console.warn('Failed to insert audit log to Supabase:', e);
      }
    }

    broadcastStateUpdate({ auditLogs: [newLog, ...auditLogs] });
  }, [auditLogs, broadcastStateUpdate]);

  const allocateRoom = useCallback(async (
    participantId: string,
    hostelId: string,
    roomNumber: string,
    bedNumber: string,
    isOverride: boolean = false,
    overrideReason: string = '',
    approvedBy: string = 'Command Center Lead'
  ) => {
    const participant = participants.find((p) => p.id === participantId);
    const hostel = hostels.find((h) => h.id === hostelId);

    if (!participant || !hostel) {
      return { success: false, error: 'Participant or Hostel record not found' };
    }

    if (hostel.status === 'closed' && !isOverride) {
      return {
        success: false,
        error: `Hostel ${hostel.name} is currently CLOSED under active disruption protocol. Requires authorized override reason.`
      };
    }

    if (hostel.gender_allowed !== 'all' && hostel.gender_allowed !== participant.gender && !isOverride) {
      return {
        success: false,
        error: `Gender Mismatch: ${hostel.name} is reserved for ${hostel.gender_allowed.toUpperCase()} delegates. Participant is ${participant.gender.toUpperCase()}. Requires authorized override reason.`
      };
    }

    const isGroundFloor = roomNumber.toLowerCase().startsWith('g') || roomNumber.startsWith('0') || roomNumber.startsWith('10');
    if (participant.accessibility_needs && !hostel.has_elevator && !isGroundFloor && !isOverride) {
      return {
        success: false,
        error: `Accessibility Constraint: Participant requires ground floor or elevator access (${participant.accessibility_note || 'Accessibility flag active'}). Room ${roomNumber} does not meet requirements.`
      };
    }

    const prevAlloc = allocations.find((a) => a.participant_id === participantId);
    const filteredAllocations = allocations.filter((a) => a.participant_id !== participantId);

    const newAllocation: AccommodationAllocation = {
      id: prevAlloc ? prevAlloc.id : `alloc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      participant_id: participantId,
      hostel_id: hostelId,
      room_number: roomNumber,
      bed_number: bedNumber,
      external_stay_id: null,
      status: 'confirmed',
      allocated_at: new Date().toISOString(),
      is_override: isOverride,
      override_reason: overrideReason || undefined,
    };

    const nextAllocations = [newAllocation, ...filteredAllocations];
    setAllocations(nextAllocations);

    setHostels((prev) =>
      prev.map((h) => {
        if (h.id === hostelId) {
          return { ...h, occupied_beds: h.occupied_beds + (prevAlloc?.hostel_id === hostelId ? 0 : 1) };
        }
        if (prevAlloc && prevAlloc.hostel_id === h.id) {
          return { ...h, occupied_beds: Math.max(0, h.occupied_beds - 1) };
        }
        return h;
      })
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('accommodation_allocations').upsert(newAllocation);
      } catch (e) {
        console.warn('Supabase allocation write error:', e);
      }
    }

    if (isOverride) {
      await logAudit(
        'accommodation_override',
        participantId,
        'allocation',
        overrideReason || 'Constraint override authorized by command lead',
        prevAlloc ? `${prevAlloc.room_number}-${prevAlloc.bed_number}` : 'Unallocated',
        `Hostel: ${hostel.name} (${roomNumber}-${bedNumber})`,
        approvedBy
      );
    }

    broadcastStateUpdate({ allocations: nextAllocations });
    return { success: true };
  }, [participants, hostels, allocations, logAudit, broadcastStateUpdate]);

  const allocateExternalStay = useCallback(async (
    participantId: string,
    externalStayId: string,
    roomNumber: string,
    bedNumber: string,
    reason: string,
    approvedBy: string
  ) => {
    const stay = externalStays.find((s) => s.id === externalStayId);
    const participant = participants.find((p) => p.id === participantId);
    if (!stay || !participant) return { success: false, error: 'Target external stay not found' };

    const prevAlloc = allocations.find((a) => a.participant_id === participantId);
    const newAlloc: AccommodationAllocation = {
      id: `alloc-ext-${Date.now()}`,
      participant_id: participantId,
      hostel_id: null,
      room_number: roomNumber,
      bed_number: bedNumber,
      external_stay_id: externalStayId,
      status: 'confirmed',
      allocated_at: new Date().toISOString(),
      is_override: true,
      override_reason: reason,
    };

    const nextAllocations = [newAlloc, ...allocations.filter((a) => a.participant_id !== participantId)];
    setAllocations(nextAllocations);

    setExternalStays((prev) =>
      prev.map((s) => (s.id === externalStayId ? { ...s, occupied_beds: s.occupied_beds + 1, status: 'active' } : s))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('accommodation_allocations').upsert(newAlloc);
      } catch (e) {
        console.warn('Supabase external stay write error:', e);
      }
    }

    await logAudit(
      'external_overflow_activated',
      participantId,
      'allocation',
      reason,
      prevAlloc ? `Hostel: ${prevAlloc.hostel_id}` : 'Unallocated',
      `External Stay: ${stay.name} (${roomNumber})`,
      approvedBy
    );

    broadcastStateUpdate({ allocations: nextAllocations });
    return { success: true };
  }, [externalStays, participants, allocations, logAudit, broadcastStateUpdate]);

  const deallocateParticipant = useCallback(async (participantId: string, reason: string = 'Manual Vacate') => {
    const existing = allocations.find((a) => a.participant_id === participantId);
    if (!existing) return;

    const next = allocations.filter((a) => a.participant_id !== participantId);
    setAllocations(next);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('accommodation_allocations').delete().eq('participant_id', participantId);
      } catch (e) {
        console.warn('Supabase deallocate error:', e);
      }
    }

    await logAudit(
      'accommodation_override',
      participantId,
      'allocation',
      reason,
      `Allocated Room ${existing.room_number}`,
      'Vacated / Unallocated',
      'Hospitality Lead'
    );
    broadcastStateUpdate({ allocations: next });
  }, [allocations, logAudit, broadcastStateUpdate]);

  const toggleCheckIn = useCallback(async (participantId: string) => {
    let nextStatus = false;
    let nextTime: string | null = null;

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          nextStatus = !p.checked_in;
          nextTime = nextStatus ? new Date().toISOString() : null;
          return { ...p, checked_in: nextStatus, checked_in_at: nextTime };
        }
        return p;
      })
    );

    setCheckedInCount((prev) => (nextStatus ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, desk: 'Directorate Desk' }),
      });
    } catch (e) {
      // Local network fallback
    }

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('participants')
          .update({ checked_in: nextStatus, checked_in_at: nextTime })
          .eq('id', participantId);
      } catch (e) {
        console.warn('Supabase toggle check in error:', e);
      }
    }
  }, []);

  const updateEventVenue = useCallback(async (eventId: string, newVenueId: string, reason: string, approvedBy: string) => {
    const ev = events.find((e) => e.id === eventId);
    const oldVenue = venues.find((v) => v.id === ev?.venue_id);
    const newVenue = venues.find((v) => v.id === newVenueId);

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, venue_id: newVenueId, status: 'venue_shifted' as const } : e))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('events').update({ venue_id: newVenueId, status: 'venue_shifted' }).eq('id', eventId);
      } catch (e) {
        console.warn('Supabase update venue error:', e);
      }
    }

    await logAudit(
      'venue_shift',
      eventId,
      'venue',
      reason,
      oldVenue?.name || 'Previous Venue',
      newVenue?.name || 'New Venue',
      approvedBy
    );
  }, [events, venues, logAudit]);

  const updateEventTime = useCallback(async (eventId: string, newStartTime: string, newEndTime: string, reason: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, start_time: newStartTime, end_time: newEndTime, status: 'delayed' as const } : e))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('events').update({ start_time: newStartTime, end_time: newEndTime, status: 'delayed' }).eq('id', eventId);
      } catch (e) {
        console.warn('Supabase update event time error:', e);
      }
    }

    await logAudit('venue_shift', eventId, 'venue', reason, `${ev.start_time} - ${ev.end_time}`, `${newStartTime} - ${newEndTime}`, 'Stage Operations Head');
  }, [events, logAudit]);

  const updateHostelStatus = useCallback(async (hostelId: string, status: 'operational' | 'closed' | 'maintenance', reason: string) => {
    const h = hostels.find((item) => item.id === hostelId);
    if (!h) return;

    setHostels((prev) => prev.map((item) => (item.id === hostelId ? { ...item, status } : item)));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('hostels').update({ status }).eq('id', hostelId);
      } catch (e) {
        console.warn('Supabase update hostel status error:', e);
      }
    }

    await logAudit('hostel_closure', hostelId, 'hostel', reason, `Status: ${h.status}`, `Status: ${status}`, 'Chief Warden');
  }, [hostels, logAudit]);

  const updateVendorStatus = useCallback(async (vendorId: string, status: 'compliant' | 'warning' | 'breached', notes?: string) => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, compliance_status: status, notes: notes || v.notes } : v)));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('vendors').update({ compliance_status: status, notes }).eq('id', vendorId);
      } catch (e) {
        console.warn('Supabase update vendor status error:', e);
      }
    }
  }, []);

  const injectDisruption = useCallback(async (type: string, payload: any, reason: string, approvedBy: string) => {
    const disruptionId = `disrupt-${Date.now()}`;
    setActiveDisruptions((prev) => [disruptionId, ...prev]);

    if (type === 'HOSTEL_CLOSURE') {
      const targetHostelId = payload.hostelId || 'hostel-01';
      await updateHostelStatus(targetHostelId, 'closed', `EMERGENCY DISRUPTION: ${reason}`);
    } else if (type === 'VENUE_SHIFT') {
      const targetEventId = payload.eventId || 'evt-05';
      const newVenueId = payload.newVenueId || 'ven-01';
      await updateEventVenue(targetEventId, newVenueId, `DISRUPTION SHIFT: ${reason}`, approvedBy);
    } else if (type === 'CONTINGENT_DELAY') {
      const contingentId = payload.contingentId || 'cnt-05';
      setContingents((prev) => prev.map((c) => (c.id === contingentId ? { ...c, status: 'delayed' as const } : c)));
      await logAudit('contingent_delay', contingentId, 'contingent', reason, 'expected', 'delayed', approvedBy);
    } else if (type === 'VENDOR_BREACH') {
      const vendorId = payload.vendorId || 'vnd-05';
      await updateVendorStatus(vendorId, 'breached', `LIVE TEST: ${reason}`);
      await logAudit('emergency_lockdown', vendorId, 'venue', reason, 'compliant', 'breached', approvedBy);
    }

    setLastSyncTime(formatISTTimeWithSeconds(new Date().toISOString()));
  }, [updateHostelStatus, updateEventVenue, updateVendorStatus, logAudit]);

  const resolveDisruption = useCallback(async (disruptionId: string) => {
    setActiveDisruptions((prev) => prev.filter((id) => id !== disruptionId));
    setHostels((prev) => prev.map((h) => (h.status === 'closed' ? { ...h, status: 'operational' } : h)));
    setLastSyncTime(formatISTTimeWithSeconds(new Date().toISOString()));
  }, []);

  const autoAllocateAll = useCallback(() => {
    let allocatedCount = 0;
    let violationsCount = 0;
    const currentAllocations = [...allocations];

    const unallocated = participants.filter(
      (p) => !currentAllocations.some((a) => a.participant_id === p.id && a.status !== 'vacated')
    );

    const sorted = [...unallocated].sort((a, b) => {
      if (a.accessibility_needs && !b.accessibility_needs) return -1;
      if (!a.accessibility_needs && b.accessibility_needs) return 1;
      return 0;
    });

    sorted.forEach((participant, idx) => {
      let candidateHostel = hostels.find((h) => {
        if (h.status !== 'operational') return false;
        if (h.gender_allowed !== 'all' && h.gender_allowed !== participant.gender) return false;
        if (participant.accessibility_needs && !h.has_elevator) return false;
        return h.occupied_beds < h.total_capacity;
      });

      if (!candidateHostel && participant.accessibility_needs) {
        candidateHostel = hostels.find((h) => h.id === 'hostel-05');
      }

      if (candidateHostel) {
        const floor = participant.accessibility_needs ? 'G' : '2';
        const roomNum = `${floor}0${(idx % 12) + 1}`;
        const bedNum = idx % 2 === 0 ? 'A' : 'B';

        currentAllocations.push({
          id: `auto-alloc-${participant.id}`,
          participant_id: participant.id,
          hostel_id: candidateHostel.id,
          room_number: roomNum,
          bed_number: bedNum,
          status: 'confirmed',
          allocated_at: new Date().toISOString(),
          is_override: false,
        });

        candidateHostel.occupied_beds += 1;
        allocatedCount++;
      } else {
        violationsCount++;
      }
    });

    setAllocations(currentAllocations);
    setHostels([...hostels]);
    broadcastStateUpdate({ allocations: currentAllocations, hostels: [...hostels] });

    return { allocatedCount, violationsCount };
  }, [allocations, participants, hostels, broadcastStateUpdate]);

  return (
    <FestContext.Provider
      value={{
        contingents,
        participants,
        hostels,
        externalStays,
        allocations,
        venues,
        events,
        registrations,
        vendors,
        logistics,
        merch,
        coreTeam,
        auditLogs,
        clashes,
        participantsCount,
        checkedInCount,
        auditCount,
        contingentsCount,
        isLiveConnected,
        isUsingRemoteSupabase,
        lastSyncTime,
        activeDisruptions,
        allocateRoom,
        allocateExternalStay,
        deallocateParticipant,
        toggleCheckIn,
        updateEventVenue,
        updateEventTime,
        updateHostelStatus,
        updateVendorStatus,
        injectDisruption,
        resolveDisruption,
        autoAllocateAll,
        refreshData,
        connectSupabase,
        fetchParticipantsPage,
      }}
    >
      {children}
    </FestContext.Provider>
  );
};

export const useFest = () => {
  const context = useContext(FestContext);
  if (!context) {
    throw new Error('useFest must be used within a FestProvider');
  }
  return context;
};
