'use client';

// Accommodation Matrix View
// Real-time policy enforcement: strict gender segregation, accessibility prioritization, and external stay overflow
// Zero em dashes or en dashes in any UI copy or code

import React, { useState, useMemo } from 'react';
import {
  Hotel,
  Users,
  ShieldAlert,
  Sparkles,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Compass
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { OverrideModal } from './OverrideModal';
import { ReassignModal } from './ReassignModal';
import { Participant, HostelRoom } from '@/types/database';

export const AccommodationView: React.FC = () => {
  const {
    hostels,
    hostelRooms,
    externalStays,
    allocations,
    participants,
    contingents,
    checkedInCount,
    allocateRoom,
    allocateExternalStay,
    deallocateParticipant,
    autoAllocateAll
  } = useFest();

  const [selectedBlockId, setSelectedBlockId] = useState<string>('B1');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('all');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('room_asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<{
    participant: Participant;
    hostelId: string;
    roomNumber: string;
    bedNumber: string;
    warning: string;
    targetName: string;
  } | null>(null);

  // Reassignment Modal State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<{
    participant: Participant;
    currentLocation: string;
  } | null>(null);

  const [selectedBedToAssign, setSelectedBedToAssign] = useState<{
    hostelId: string;
    roomNumber: string;
    bedNumber: string;
  } | null>(null);

  // Unallocated drawer filters
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerGender, setDrawerGender] = useState<'all' | 'female' | 'male'>('all');
  const [drawerCheckedInOnly, setDrawerCheckedInOnly] = useState(false);
  const [drawerAccessibilityOnly, setDrawerAccessibilityOnly] = useState(false);

  const activeHostel = hostels.find((h) => h.id === selectedBlockId) || hostels[0];

  // Cross-verification KPI counts
  const totalCampusCapacity = useMemo(() => hostels.reduce((sum, h) => sum + h.total_capacity, 0), [hostels]);
  const totalCampusOccupied = useMemo(
    () => allocations.filter((a) => a.hostel_id && a.status !== 'vacated').length,
    [allocations]
  );
  const totalExternalCapacity = useMemo(() => externalStays.reduce((sum, s) => sum + s.total_capacity, 0), [externalStays]);
  const totalExternalOccupied = useMemo(
    () => allocations.filter((a) => a.external_stay_id && a.status !== 'vacated').length,
    [allocations]
  );

  // Contingent styling map
  const contingentColorMap = useMemo(() => {
    const styles = [
      'bg-[#F6EFE6] border-[#E5DFD3] text-[#A3703F]',
      'bg-[#EAF3EC] border-[#C7E2CE] text-[#2D5A3E]',
      'bg-[#FAF0E4] border-[#EED5BC] text-[#7A4E1D]',
      'bg-[#FAF8F5] border-[#E5DFD3] text-[#6B655E]',
      'bg-[#F5F2EC] border-[#D8D1C5] text-[#2B2825]',
      'bg-[#EBF3F5] border-[#CFE1E5] text-[#2B5661]',
      'bg-[#F4EBF5] border-[#E2CFE5] text-[#5C2B61]',
      'bg-[#F5EBEB] border-[#E5CFCE] text-[#612B2B]',
    ];
    const map: { [id: string]: string } = {};
    contingents.forEach((c, idx) => {
      map[c.id] = styles[idx % styles.length];
    });
    return map;
  }, [contingents]);

  // Lookup map for participants
  const partMap = useMemo(() => new Map(participants.map((p) => [p.id, p])), [participants]);
  const contingentMap = useMemo(() => new Map(contingents.map((c) => [c.id, c])), [contingents]);

  // Allocations index: key = `${hostelId}_${roomNumber}_${bedNumber}`
  const allocIndex = useMemo(() => {
    const map = new Map<string, typeof allocations[0]>();
    allocations.forEach((a) => {
      if (a.hostel_id && a.status !== 'vacated') {
        map.set(`${a.hostel_id}_${a.room_number}_${a.bed_number}`, a);
      }
    });
    return map;
  }, [allocations]);

  // Rooms for active block with filter and sort
  const displayRooms = useMemo(() => {
    let list = hostelRooms.filter((r) => r.block === selectedBlockId);

    // Floor filter
    if (selectedFloor !== 'all') {
      const fl = parseInt(selectedFloor);
      list = list.filter((r) => r.floor === fl);
    }

    // Capacity filter
    if (selectedCapacity !== 'all') {
      const cap = parseInt(selectedCapacity);
      list = list.filter((r) => r.capacity === cap);
    }

    // Accessibility filter
    if (selectedAccessibility === 'accessible') {
      list = list.filter((r) => r.accessibility);
    }

    // Search filter: room id or occupant name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        if (r.room_id.toLowerCase().includes(q)) return true;
        // Check occupants in this room
        const bedLetters = ['A', 'B', 'C', 'D'].slice(0, r.capacity);
        for (const b of bedLetters) {
          const alloc = allocIndex.get(`${r.block}_${r.room_id}_${b}`);
          if (alloc) {
            const p = partMap.get(alloc.participant_id);
            const pCnt = p ? contingentMap.get(p.contingent_id) : null;
            if (p && (p.name.toLowerCase().includes(q) || (pCnt && pCnt.name.toLowerCase().includes(q)))) {
              return true;
            }
          }
        }
        return false;
      });
    }

    // Occupancy filter
    if (selectedOccupancy !== 'all') {
      list = list.filter((r) => {
        const bedLetters = ['A', 'B', 'C', 'D'].slice(0, r.capacity);
        let occ = 0;
        for (const b of bedLetters) {
          if (allocIndex.has(`${r.block}_${r.room_id}_${b}`)) occ++;
        }
        if (selectedOccupancy === 'vacant') return occ === 0;
        if (selectedOccupancy === 'partial') return occ > 0 && occ < r.capacity;
        if (selectedOccupancy === 'full') return occ === r.capacity;
        return true;
      });
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'room_asc') return a.room_id.localeCompare(b.room_id);
      if (sortBy === 'room_desc') return b.room_id.localeCompare(a.room_id);
      if (sortBy === 'floor_asc') return a.floor - b.floor;
      if (sortBy === 'capacity_desc') return b.capacity - a.capacity;
      if (sortBy === 'capacity_asc') return a.capacity - b.capacity;
      if (sortBy === 'occupancy_desc' || sortBy === 'occupancy_asc') {
        const bedLettersA = ['A', 'B', 'C', 'D'].slice(0, a.capacity);
        const bedLettersB = ['A', 'B', 'C', 'D'].slice(0, b.capacity);
        let occA = 0;
        let occB = 0;
        for (const bed of bedLettersA) if (allocIndex.has(`${a.block}_${a.room_id}_${bed}`)) occA++;
        for (const bed of bedLettersB) if (allocIndex.has(`${b.block}_${b.room_id}_${bed}`)) occB++;
        const rateA = occA / a.capacity;
        const rateB = occB / b.capacity;
        return sortBy === 'occupancy_desc' ? rateB - rateA : rateA - rateB;
      }
      return 0;
    });

    return list;
  }, [hostelRooms, selectedBlockId, selectedFloor, selectedCapacity, selectedAccessibility, searchQuery, selectedOccupancy, sortBy, allocIndex, partMap]);

  // Unallocated participants
  const unallocatedParticipants = useMemo(() => {
    const allocatedParticipantIds = new Set(
      allocations.filter((a) => a.status !== 'vacated').map((a) => a.participant_id)
    );
    return participants.filter((p) => !allocatedParticipantIds.has(p.id));
  }, [participants, allocations]);

  // Filtered unallocated queue
  const filteredUnallocated = useMemo(() => {
    return unallocatedParticipants.filter((p) => {
      const q = drawerSearch.toLowerCase();
      const cnt = contingentMap.get(p.contingent_id);
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (cnt && cnt.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (drawerGender !== 'all' && p.gender !== drawerGender) return false;
      if (drawerCheckedInOnly && !p.checked_in) return false;
      if (drawerAccessibilityOnly && !p.accessibility_needs) return false;
      return true;
    });
  }, [unallocatedParticipants, contingentMap, drawerSearch, drawerGender, drawerCheckedInOnly, drawerAccessibilityOnly]);

  const checkedInUnallocatedCount = useMemo(() => {
    return unallocatedParticipants.filter((p) => p.checked_in).length;
  }, [unallocatedParticipants]);

  // Handle Bed Allocation Attempt
  const handleAssignBed = async (participant: Participant, hostelId: string, roomId: string, bedNumber: string) => {
    const hostel = hostels.find((h) => h.id === hostelId);
    if (!hostel) return;

    let violationMessage = '';

    if (hostel.status === 'closed') {
      violationMessage = `Hostel ${hostel.name} is marked CLOSED under active emergency protocol.`;
    } else if (hostel.gender_allowed !== 'all' && hostel.gender_allowed !== participant.gender) {
      violationMessage = `GENDER SEGREGATION CONSTRAINT: ${hostel.name} is designated as ${hostel.gender_allowed.toUpperCase()} ONLY. Selected delegate is registered as ${participant.gender.toUpperCase()}.`;
    } else if (participant.accessibility_needs && !hostel.has_elevator && !roomId.includes('-0-')) {
      violationMessage = `ACCESSIBILITY CONSTRAINT: ${participant.name} has recorded mobility/accessibility needs ("${participant.accessibility_note || 'Ground floor required'}"). Room ${roomId} is on an upper floor without elevator access.`;
    }

    if (violationMessage) {
      setPendingAllocation({
        participant,
        hostelId: hostel.id,
        roomNumber: roomId,
        bedNumber,
        warning: violationMessage,
        targetName: `${hostel.name} - Room ${roomId} (Bed ${bedNumber})`,
      });
      setIsModalOpen(true);
    } else {
      await allocateRoom(participant.id, hostel.id, roomId, bedNumber, false);
      setSelectedBedToAssign(null);
    }
  };

  const handleConfirmOverride = async (reason: string, approvedBy: string) => {
    if (!pendingAllocation) return;
    await allocateRoom(
      pendingAllocation.participant.id,
      pendingAllocation.hostelId,
      pendingAllocation.roomNumber,
      pendingAllocation.bedNumber,
      true,
      reason,
      approvedBy
    );
    setPendingAllocation(null);
    setSelectedBedToAssign(null);
  };

  const handleConfirmReassign = async (
    participantId: string,
    facilityType: 'hostel' | 'external',
    facilityId: string,
    roomNumber: string,
    bedNumber: string,
    reassignReason: string
  ) => {
    if (facilityType === 'hostel') {
      await allocateRoom(participantId, facilityId, roomNumber, bedNumber, true, reassignReason, 'Hospitality Lead');
    } else {
      await allocateExternalStay(participantId, facilityId, roomNumber, bedNumber, reassignReason, 'Hospitality Lead');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Campus Hostels Directorate
            </span>
            <span className="text-xs text-[#8F8982] font-mono">Dataset Verified: 200 Rooms · 710 Beds</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Hostel Allocation & Room Grid</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Real dataset mapping across Blocks B1, B2, B3 (Boys) and G1, G2 (Girls). Strict gender segregation, multi-member room displays, and accessibility enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const res = autoAllocateAll();
              alert(`Auto-Allocation Run Completed:\n- ${res.allocatedCount} delegate(s) successfully assigned.\n- Strict single-gender rooms enforced.\n- Longest stays placed in campus hostels; overflow routed to external stays.\n- ${res.violationsCount} unassigned due to closed or zero-capacity facilities.`);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#F6EFE6]" />
            <span>Run Auto-Allocate Engine</span>
          </button>
        </div>
      </div>

      {/* Cross-Verification Reconciliation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#8F8982]">Total Delegates</p>
          <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">{participants.length}</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">Dataset Pool</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-800">Checked-In (Desk)</p>
          <p className="text-xl font-serif font-bold text-emerald-900 mt-0.5">{checkedInCount}</p>
          <p className="text-[10px] text-emerald-700 font-mono mt-0.5">Synchronized Live</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#8F8982]">Campus Hostels</p>
          <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">
            {totalCampusOccupied} <span className="text-xs text-[#8F8982] font-normal">/ {totalCampusCapacity}</span>
          </p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">
            {totalCampusCapacity > 0 ? Math.round((totalCampusOccupied / totalCampusCapacity) * 100) : 0}% Occupancy
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A3703F]">External Overflow</p>
          <p className="text-xl font-serif font-bold text-[#A3703F] mt-0.5">
            {totalExternalOccupied} <span className="text-xs text-[#8F8982] font-normal">/ {totalExternalCapacity}</span>
          </p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">
            {totalExternalCapacity > 0 ? Math.round((totalExternalOccupied / totalExternalCapacity) * 100) : 0}% Overflow Used
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#8F8982]">Unallocated</p>
          <p className="text-xl font-serif font-bold text-amber-900 mt-0.5">{unallocatedParticipants.length}</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">Pending Bed Assignment</p>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-xs ${
          checkedInUnallocatedCount > 0
            ? 'bg-amber-50/60 border-amber-300 text-amber-900'
            : 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
        }`}>
          <p className="text-[10px] uppercase font-bold">Checked-In Needing Bed</p>
          <p className="text-xl font-serif font-bold mt-0.5">{checkedInUnallocatedCount}</p>
          <p className="text-[10px] font-mono mt-0.5">
            {checkedInUnallocatedCount > 0 ? 'Urgent Priority' : 'All Arrived Housed'}
          </p>
        </div>
      </div>

      {/* Block Selector Tabs */}
      <div className="space-y-3 bg-white border border-[#E5DFD3] rounded-2xl p-4 shadow-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F5F2EC]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8982]">Select Hostel Block</span>
            <div className="flex items-center gap-2 mt-1 overflow-x-auto pb-1">
              {hostels.map((h) => {
                const isSelected = selectedBlockId === h.id;
                const isBoys = h.gender_allowed === 'male';
                const occupied = allocations.filter((a) => a.hostel_id === h.id && a.status !== 'vacated').length;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedBlockId(h.id);
                      setSelectedBedToAssign(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isSelected
                        ? isBoys
                          ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                          : 'bg-rose-900 text-white border-rose-900 shadow-md'
                        : isBoys
                        ? 'bg-blue-50/50 hover:bg-blue-50 text-blue-950 border-blue-200'
                        : 'bg-rose-50/50 hover:bg-rose-50 text-rose-950 border-rose-200'
                    }`}
                  >
                    <span>{h.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#6B655E] border border-[#E5DFD3]'
                    }`}>
                      {occupied}/{h.total_capacity} Beds
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice to External Stays View */}
          <div className="p-2.5 rounded-xl bg-[#FAF0E4] border border-[#EED5BC] text-xs shrink-0 max-w-sm">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Hotel className="w-3.5 h-3.5 text-[#A3703F]" />
              <span>Looking for Off-Campus Stays?</span>
            </div>
            <p className="text-[11px] text-[#7A4E1D] mt-0.5">
              Access the dedicated External Accommodations portal for full details on all 6 properties (740 beds).
            </p>
          </div>
        </div>

        {/* Filter & Search Ribbon for Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-1">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search room (e.g. B1-0-01) or occupant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            />
            <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2.5 top-2.5" />
          </div>

          {/* Floor Filter */}
          <div>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            >
              <option value="all">All Floors (0 to 3)</option>
              <option value="0">Floor 0 (Ground / Accessible)</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>

          {/* Capacity Filter */}
          <div>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            >
              <option value="all">All Capacities</option>
              <option value="2">2-Bed Rooms (Accessible)</option>
              <option value="3">3-Bed Rooms</option>
              <option value="4">4-Bed Rooms</option>
            </select>
          </div>

          {/* Occupancy Filter */}
          <div>
            <select
              value={selectedOccupancy}
              onChange={(e) => setSelectedOccupancy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            >
              <option value="all">All Occupancy</option>
              <option value="vacant">Vacant Rooms Only</option>
              <option value="partial">Partially Occupied</option>
              <option value="full">Fully Occupied</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            >
              <option value="room_asc">Room Number (Asc)</option>
              <option value="room_desc">Room Number (Desc)</option>
              <option value="floor_asc">Floor (0 to 3)</option>
              <option value="capacity_desc">Capacity (Largest First)</option>
              <option value="capacity_asc">Capacity (Smallest First)</option>
              <option value="occupancy_desc">Occupancy (Full First)</option>
              <option value="occupancy_asc">Occupancy (Vacant First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Room Cards (3 cols) + Unallocated Queue (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Room Grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B655E]">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-[#1A1A1A] text-sm">
                {activeHostel?.name} ({displayRooms.length} Rooms Shown)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                activeHostel?.gender_allowed === 'male'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                Strictly {activeHostel?.gender_allowed.toUpperCase()} Only
              </span>
            </div>

            {selectedBedToAssign && (
              <div className="text-[#7A4E1D] font-bold bg-[#FAF0E4] px-3 py-1 rounded-lg border border-[#EED5BC] text-xs animate-pulse">
                Target: {selectedBedToAssign.roomNumber} ({selectedBedToAssign.bedNumber}). Click delegate in right queue.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {displayRooms.map((room) => {
              const bedLetters = ['A', 'B', 'C', 'D'].slice(0, room.capacity);
              const roomAllocs = bedLetters.map((b) => allocIndex.get(`${room.block}_${room.room_id}_${b}`) || null);
              const occupiedCount = roomAllocs.filter(Boolean).length;
              const isGround = room.floor === 0;

              return (
                <div
                  key={room.room_id}
                  className={`bg-white border rounded-2xl p-4 shadow-card hover:shadow-luxury transition-all space-y-3 ${
                    occupiedCount === room.capacity
                      ? 'border-[#E5DFD3]'
                      : occupiedCount > 0
                      ? 'border-amber-300/80'
                      : 'border-[#E5DFD3]'
                  }`}
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE3]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] text-sm">{room.room_id}</span>
                      {room.accessibility && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                          ♿ Accessible
                        </span>
                      )}
                      {isGround && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Ground
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#8F8982] font-mono">Floor {room.floor}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E5DFD3] text-[#1A1A1A]">
                        {occupiedCount}/{room.capacity} Beds
                      </span>
                    </div>
                  </div>

                  {/* Bed Slots (Renders 2, 3, or 4 beds according to room capacity) */}
                  <div className="space-y-2">
                    {bedLetters.map((bedLetter, idx) => {
                      const alloc = roomAllocs[idx];
                      const occupant = alloc ? partMap.get(alloc.participant_id) : null;
                      const cnt = occupant ? contingentMap.get(occupant.contingent_id) : null;
                      const isTarget =
                        selectedBedToAssign?.roomNumber === room.room_id &&
                        selectedBedToAssign?.bedNumber === bedLetter;

                      return (
                        <div
                          key={bedLetter}
                          className={`p-2.5 rounded-xl text-xs transition-all border ${
                            occupant
                              ? alloc?.is_override
                                ? 'bg-[#FAF0E4] border-[#EED5BC] text-[#7A4E1D]'
                                : cnt
                                ? contingentColorMap[cnt.id] || 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                                : 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                              : isTarget
                              ? 'bg-[#FAF0E4] border-[#A3703F] text-[#7A4E1D] animate-pulse ring-2 ring-[#A3703F]/20'
                              : 'bg-[#FAF8F5]/60 border-dashed border-[#D8D1C5] text-[#8F8982] hover:border-[#A3703F]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-[#8F8982]">Bed {bedLetter}</span>
                            {occupant ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setReassignTarget({
                                      participant: occupant,
                                      currentLocation: `${activeHostel.name} · Room ${room.room_id} (Bed ${bedLetter})`
                                    });
                                    setIsReassignOpen(true);
                                  }}
                                  className="text-[10px] text-[#A3703F] hover:underline font-bold"
                                >
                                  Change
                                </button>
                                <button
                                  onClick={() => deallocateParticipant(occupant.id, 'Organizer deallocated bed')}
                                  className="text-[10px] text-[#7C2D2A] hover:underline font-semibold"
                                >
                                  Vacate
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedBedToAssign({ hostelId: room.block, roomNumber: room.room_id, bedNumber: bedLetter })}
                                className="text-[10px] text-[#A3703F] hover:underline font-semibold"
                              >
                                {isTarget ? 'Target Selected' : '+ Assign'}
                              </button>
                            )}
                          </div>

                          {occupant ? (
                            <div>
                              <p className="font-bold text-[#1A1A1A] text-xs truncate">{occupant.name}</p>
                              <p className="text-[10px] text-[#6B655E] truncate">
                                {cnt?.name || occupant.college || 'Delegate'}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span className={`text-[9px] uppercase font-mono px-1 rounded border font-semibold ${
                                  occupant.gender === 'male'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                  {occupant.gender}
                                </span>
                                {occupant.checked_in && (
                                  <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                    ✓ Checked In
                                  </span>
                                )}
                                {occupant.accessibility_needs && (
                                  <span className="text-[9px] px-1 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">
                                    ♿ Acc
                                  </span>
                                )}
                                {alloc?.is_override && (
                                  <span className="text-[9px] px-1 rounded bg-[#FAECEB] text-[#7C2D2A] font-bold">
                                    Override
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-[#8F8982] py-1 text-center font-mono">Available</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unallocated Delegates Drawer */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-luxury space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A3703F]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-sm">
                  Unallocated ({filteredUnallocated.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8F8982] uppercase bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD3]">
                {unallocatedParticipants.length} Total
              </span>
            </div>

            {/* Quick Overflow Notice */}
            <div className="p-3 rounded-xl bg-[#FAF0E4] border border-[#EED5BC] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Hotel className="w-3.5 h-3.5" />
                <span>6 External Stays Available</span>
              </div>
              <p className="text-[11px] text-[#7A4E1D]">
                Campus capacity is 710 beds. External capacity provides 740 beds across Campus Guest House, Maa Sarada Hostel, Central Residency, Lakeview Hotel, Shakti Lodge, and City Inn.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search unallocated..."
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 pl-7 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
              />
              <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2 top-2" />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setDrawerGender('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  drawerGender === 'all'
                    ? 'bg-[#A3703F] text-white'
                    : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDrawerGender('female')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  drawerGender === 'female'
                    ? 'bg-rose-900 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                Girls
              </button>
              <button
                onClick={() => setDrawerGender('male')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  drawerGender === 'male'
                    ? 'bg-blue-900 text-white'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                Boys
              </button>
              <button
                onClick={() => setDrawerCheckedInOnly(!drawerCheckedInOnly)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  drawerCheckedInOnly
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                ✓ Checked-In
              </button>
              <button
                onClick={() => setDrawerAccessibilityOnly(!drawerAccessibilityOnly)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  drawerAccessibilityOnly
                    ? 'bg-purple-800 text-white'
                    : 'bg-purple-50 text-purple-800 border border-purple-200'
                }`}
              >
                ♿ Accessible
              </button>
            </div>

            {/* Delegate List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredUnallocated.length === 0 ? (
                <p className="text-xs text-[#8F8982] text-center py-6">No matching unallocated delegates.</p>
              ) : (
                filteredUnallocated.map((p) => {
                  const cnt = contingentMap.get(p.contingent_id);
                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] hover:bg-white hover:border-[#A3703F] transition-all text-xs space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A] truncate">{p.name}</span>
                        <span className={`text-[9px] uppercase font-mono px-1 rounded ${
                          p.gender === 'female'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : 'bg-blue-100 text-blue-800 font-bold'
                        }`}>
                          {p.gender}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B655E] truncate">
                        {cnt?.name || p.college || 'Delegate'}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#EFEBE3]">
                        <div className="flex items-center gap-1">
                          {p.checked_in && (
                            <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                              ✓ Arrived
                            </span>
                          )}
                          {p.accessibility_needs && (
                            <span className="text-[9px] px-1 rounded bg-purple-100 text-purple-900 font-bold">
                              ♿ Acc
                            </span>
                          )}
                        </div>

                        {selectedBedToAssign ? (
                          <button
                            onClick={() =>
                              handleAssignBed(
                                p,
                                selectedBedToAssign.hostelId,
                                selectedBedToAssign.roomNumber,
                                selectedBedToAssign.bedNumber
                              )
                            }
                            className="text-[10px] px-2 py-0.5 rounded bg-[#A3703F] text-white font-bold hover:bg-[#8C6D36] transition-all"
                          >
                            Assign to {selectedBedToAssign.roomNumber} ({selectedBedToAssign.bedNumber})
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#8F8982] italic">Select a bed first</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Policy Override Modal */}
      {isModalOpen && pendingAllocation && (
        <OverrideModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPendingAllocation(null);
          }}
          constraintWarning={pendingAllocation.warning}
          participantName={pendingAllocation.participant.name}
          targetLocation={pendingAllocation.targetName}
          onConfirmOverride={handleConfirmOverride}
        />
      )}

      {/* Bed Reassignment Modal */}
      {isReassignOpen && reassignTarget && (
        <ReassignModal
          isOpen={isReassignOpen}
          onClose={() => {
            setIsReassignOpen(false);
            setReassignTarget(null);
          }}
          participant={reassignTarget.participant}
          currentLocation={reassignTarget.currentLocation}
          hostels={hostels}
          externalStays={externalStays}
          allocations={allocations}
          participants={participants}
          onConfirmReassign={handleConfirmReassign}
        />
      )}
    </div>
  );
};
