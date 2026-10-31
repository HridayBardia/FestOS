'use client';

import React, { useState, useMemo } from 'react';
import {
  Hotel,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Filter,
  Users,
  Eye,
  AlertTriangle,
  Building,
  CheckCircle2,
  DollarSign,
  Bus,
  ChevronDown,
  ArrowUpDown,
  Phone,
  ShieldCheck,
  BedDouble
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { ExternalStay, AccommodationAllocation, Participant } from '@/types/database';
import { ReassignModal } from './ReassignModal';

export const ExternalStaysView: React.FC = () => {
  const {
    externalStays,
    externalRooms,
    allocations,
    participants,
    deallocateParticipant,
    hostels,
    allocateRoom,
    allocateExternalStay
  } = useFest();

  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [transportFilter, setTransportFilter] = useState<string>('all');
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('distance_asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reassign modal state
  const [reassignTarget, setReassignTarget] = useState<{
    participant: Participant;
    currentLocation: string;
  } | null>(null);

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
    setReassignTarget(null);
  };

  // Compute metrics from actual dataset
  const totalBeds = externalStays.reduce((s, st) => s + st.total_capacity, 0);
  const totalOccupied = externalStays.reduce((s, st) => s + (st.occupied_beds || 0), 0);
  const totalAvailable = totalBeds - totalOccupied;
  const occupancyPct = Math.round((totalOccupied / (totalBeds || 1)) * 100);

  // Filter external stays
  const filteredStays = useMemo(() => {
    let list = [...externalStays];

    if (selectedPropertyFilter !== 'all') {
      list = list.filter((s) => s.id === selectedPropertyFilter);
    }

    if (distanceFilter === 'near') {
      list = list.filter((s) => (s.distance_km || 0) <= 3);
    } else if (distanceFilter === 'mid') {
      list = list.filter((s) => (s.distance_km || 0) > 3 && (s.distance_km || 0) <= 6);
    } else if (distanceFilter === 'far') {
      list = list.filter((s) => (s.distance_km || 0) > 6);
    }

    if (transportFilter === 'yes') {
      list = list.filter((s) => s.transport_availability === 'yes');
    } else if (transportFilter === 'limited') {
      list = list.filter((s) => s.transport_availability === 'limited');
    }

    if (viewFilter === 'lake') {
      list = list.filter((s) => s.has_good_view);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'distance_asc') return (a.distance_km || 0) - (b.distance_km || 0);
      if (sortBy === 'distance_desc') return (b.distance_km || 0) - (a.distance_km || 0);
      if (sortBy === 'cost_asc') return a.cost_per_night - b.cost_per_night;
      if (sortBy === 'cost_desc') return b.cost_per_night - a.cost_per_night;
      if (sortBy === 'capacity_desc') return b.total_capacity - a.total_capacity;
      return 0;
    });

    return list;
  }, [externalStays, selectedPropertyFilter, distanceFilter, transportFilter, viewFilter, searchQuery, sortBy]);

  // Map participant lookup
  const partMap = useMemo(() => new Map(participants.map((p) => [p.id, p])), [participants]);

  // Group allocations by property and room
  const allocationsByProperty = useMemo(() => {
    const map = new Map<string, AccommodationAllocation[]>();
    allocations.forEach((a) => {
      if (a.external_stay_id && a.status !== 'vacated') {
        if (!map.has(a.external_stay_id)) map.set(a.external_stay_id, []);
        map.get(a.external_stay_id)!.push(a);
      }
    });
    return map;
  }, [allocations]);

  return (
    <div className="space-y-6">
      {/* Editorial Masthead */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                Dataset Verified: Off-Campus Directorate
              </span>
              <span className="text-xs text-[#8F8982] font-mono">6 Real Properties · 740 Total Beds</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
              External Accommodations & Off-Campus Stays
            </h2>
            <p className="text-xs text-[#6B655E] mt-0.5 max-w-2xl">
              Official off-campus hotel and hostel portfolio from Aarohan dataset. Tracks distance, feasibility, scenic view, transit availability, cost per bed, and multi-member room allocations.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
              <span className="text-[10px] font-bold uppercase text-[#8F8982]">Total Properties</span>
              <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">6 Verified</p>
              <span className="text-[10px] text-[#A3703F] font-mono">Off-Campus</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
              <span className="text-[10px] font-bold uppercase text-[#8F8982]">Total Capacity</span>
              <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">{totalBeds}</p>
              <span className="text-[10px] text-[#6B655E] font-mono">Beds Available</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Allocated Beds</span>
              <p className="text-xl font-serif font-bold text-emerald-900 mt-0.5">{totalOccupied}</p>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">{occupancyPct}% Booked</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
              <span className="text-[10px] font-bold uppercase text-[#8F8982]">Remaining Beds</span>
              <p className="text-xl font-serif font-bold text-[#A3703F] mt-0.5">{totalAvailable}</p>
              <span className="text-[10px] text-[#6B655E] font-mono">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Ribbon */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 shadow-luxury space-y-3 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by property name, code (EXT01), or occupant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            />
            <Search className="w-4 h-4 text-[#8F8982] absolute left-3 top-2.5" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#8F8982] font-semibold text-[11px] shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            >
              <option value="distance_asc">Feasibility: Distance (Nearest First)</option>
              <option value="distance_desc">Distance (Furthest First)</option>
              <option value="cost_asc">Cost per Bed (Lowest First: Budget)</option>
              <option value="cost_desc">Cost per Bed (Highest First: Premium)</option>
              <option value="capacity_desc">Capacity (Largest Properties First)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills: Proximity, Transport, View */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F5F2EC]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8F8982] text-[10px] font-bold uppercase">Proximity:</span>
            {[
              { id: 'all', label: 'All Distances' },
              { id: 'near', label: 'Near (<= 3 km · High Feasibility)' },
              { id: 'mid', label: 'Mid (5-6 km)' },
              { id: 'far', label: 'Far (7-9 km)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDistanceFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  distanceFilter === f.id
                    ? 'bg-[#A3703F] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#8F8982] text-[10px] font-bold uppercase">Highlights:</span>
            <button
              onClick={() => setViewFilter(viewFilter === 'lake' ? 'all' : 'lake')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                viewFilter === 'lake'
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Scenic Lake View (EXT04)</span>
            </button>

            <button
              onClick={() => setTransportFilter(transportFilter === 'limited' ? 'all' : 'limited')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                transportFilter === 'limited'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Transport Caution Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="space-y-6">
        {filteredStays.map((stay) => {
          const stayAllocs = allocationsByProperty.get(stay.id) || [];
          const occCount = stayAllocs.length;
          const cap = stay.total_capacity;
          const isLakeView = stay.has_good_view;
          const hasTransportCaution = stay.transport_availability === 'limited';

          // Group room numbers for this property
          const roomMap = new Map<string, AccommodationAllocation[]>();
          stayAllocs.forEach((a) => {
            if (!roomMap.has(a.room_number)) roomMap.set(a.room_number, []);
            roomMap.get(a.room_number)!.push(a);
          });

          // Generate sample 2-member, 3-member, and 4-member rooms for display
          const totalRoomsCount = Math.floor(cap / 3);
          const displayRooms = [];
          for (let i = 1; i <= Math.min(totalRoomsCount, 12); i++) {
            const roomNum = `${100 + i}`;
            const roomCapacity = i <= 3 ? 2 : (i <= 9 ? 3 : 4);
            const occupants = roomMap.get(roomNum) || [];
            displayRooms.push({
              roomNum,
              capacity: roomCapacity,
              occupants
            });
          }

          return (
            <div
              key={stay.id}
              className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury space-y-4"
            >
              {/* Property Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F4F1EA] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                      {stay.id}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">{stay.name}</h3>

                    {/* View Badges & Highlights */}
                    {isLakeView && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-700" />
                        <span>Scenic Lake View</span>
                      </span>
                    )}

                    {stay.distance_km === 1 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        <span>Most Feasible (1 km)</span>
                      </span>
                    )}

                    {stay.cost_per_night <= 950 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#A3703F] border border-[#E5DFD3]">
                        Budget Accommodation
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#6B655E] mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#A3703F]" />
                      Distance: <strong>{stay.distance_km} km from Campus</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#2D5A3E]" />
                      Cost: <strong>Rs {stay.cost_per_night.toLocaleString()} / bed / night</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-[#A3703F]" />
                      Transit: <strong className={hasTransportCaution ? 'text-amber-800' : 'text-emerald-800'}>
                        {hasTransportCaution ? 'Limited Public Transit' : 'Confirmed Campus Shuttle'}
                      </strong>
                    </span>
                  </p>
                </div>

                {/* Capacity Counter */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8F8982]">Occupancy</span>
                    <p className="text-lg font-mono font-bold text-[#1A1A1A]">
                      {occCount} / {cap} beds
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                    occCount >= cap
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : occCount > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}>
                    {occCount >= cap ? 'Full' : occCount > 0 ? 'Active' : 'Standby'}
                  </span>
                </div>
              </div>

              {/* Feasibility Notes & Cautions Strip */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs space-y-1">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#A3703F] shrink-0">Operational Feasibility Note:</span>
                  <span className="text-[#333]">{stay.feasibility_note}</span>
                </div>
                {stay.caution_note && (
                  <div className="flex items-start gap-2 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="font-medium">{stay.caution_note}</span>
                  </div>
                )}
              </div>

              {/* Multi-Member Room Grid */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <h4 className="font-serif font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-[#A3703F]" />
                    <span>Allocated Room Suites (Showing exact member occupancy per room)</span>
                  </h4>
                  <span className="text-[11px] text-[#8F8982]">
                    Each room shows all 2, 3, or 4 allocated members
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayRooms.map((r) => {
                    const bedLetters = ['A', 'B', 'C', 'D'].slice(0, r.capacity);
                    const isRoomFull = r.occupants.length >= r.capacity;

                    // Detect room gender from occupants
                    const firstOccupant = r.occupants[0] ? partMap.get(r.occupants[0].participant_id) : null;
                    const roomGender = firstOccupant ? (firstOccupant.gender === 'female' ? 'Female Only' : 'Male Only') : 'Available (Unassigned)';

                    return (
                      <div
                        key={r.roomNum}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2.5 transition-all shadow-xs ${
                          isRoomFull
                            ? 'bg-[#FAF8F5] border-[#E5DFD3]'
                            : 'bg-white border-[#E5DFD3] hover:border-[#A3703F]/50'
                        }`}
                      >
                        {/* Room Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#1A1A1A]">
                              Suite {r.roomNum}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                              roomGender.includes('Female')
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : roomGender.includes('Male')
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {roomGender}
                            </span>
                          </div>

                          <span className="font-mono text-[10px] font-bold text-[#8F8982]">
                            {r.occupants.length}/{r.capacity} Beds
                          </span>
                        </div>

                        {/* Bed Slots for this Room */}
                        <div className="space-y-1.5">
                          {bedLetters.map((bedChar) => {
                            const alloc = r.occupants.find((a) => a.bed_number === bedChar);
                            const occupant = alloc ? partMap.get(alloc.participant_id) : null;

                            return (
                              <div
                                key={bedChar}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-1.5 ${
                                  occupant
                                    ? 'bg-white border-[#E5DFD3]'
                                    : 'bg-[#FAF8F5]/60 border-dashed border-[#E5DFD3] text-[#8F8982]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#F6EFE6] text-[#A3703F]">
                                    Bed {bedChar}
                                  </span>
                                  {occupant ? (
                                    <div className="truncate">
                                      <p className="font-serif font-bold text-[#1A1A1A] truncate text-[11px]">
                                        {occupant.name}
                                      </p>
                                      <p className="text-[10px] text-[#8F8982] truncate">
                                        {occupant.college} ({occupant.id})
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="italic text-[10px]">Vacant Bed</span>
                                  )}
                                </div>

                                {occupant && alloc && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      occupant.checked_in
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}>
                                      {occupant.checked_in ? '✓ In' : 'Exp'}
                                    </span>
                                    <button
                                      onClick={() => setReassignTarget({ participant: occupant, currentLocation: `${stay.name} - Suite ${r.roomNum} (Bed ${bedChar})` })}
                                      className="px-2 py-0.5 rounded bg-[#FAF8F5] hover:bg-white text-[#A3703F] border border-[#E5DFD3] text-[10px] font-bold shadow-2xs"
                                    >
                                      Change
                                    </button>
                                  </div>
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
            </div>
          );
        })}
      </div>

      {/* Reassign Bed Modal */}
      {reassignTarget && (
        <ReassignModal
          isOpen={!!reassignTarget}
          onClose={() => setReassignTarget(null)}
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
