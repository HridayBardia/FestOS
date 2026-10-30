'use client';

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
  ChevronDown
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { OverrideModal } from './OverrideModal';
import { Participant } from '@/types/database';

export const AccommodationView: React.FC = () => {
  const {
    hostels,
    externalStays,
    allocations,
    participants,
    contingents,
    allocateRoom,
    allocateExternalStay,
    deallocateParticipant,
    autoAllocateAll
  } = useFest();

  const [selectedFacilityType, setSelectedFacilityType] = useState<'hostel' | 'external'>('hostel');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(hostels[0]?.id || 'hostel-01');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<{
    participant: Participant;
    hostelId: string;
    roomNumber: string;
    bedNumber: string;
    warning: string;
    targetName: string;
  } | null>(null);

  const [selectedBedToAssign, setSelectedBedToAssign] = useState<{
    roomNumber: string;
    bedNumber: string;
  } | null>(null);

  const activeHostel = hostels.find((h) => h.id === selectedFacilityId);
  const activeExternalStay = externalStays.find((s) => s.id === selectedFacilityId);

  // Elegant Luxury Contingent Palette
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

  // Generate rooms for current facility
  const roomsList = useMemo(() => {
    if (selectedFacilityType === 'hostel') {
      const h = activeHostel;
      if (!h) return [];
      const rooms: { roomNumber: string; floor: string }[] = [];
      const floors = ['G', '1', '2', '3'].slice(0, h.floor_count + 1);

      floors.forEach((f) => {
        if (selectedFloor !== 'all' && selectedFloor !== f) return;
        for (let i = 1; i <= 8; i++) {
          const roomNumber = `${f}${i < 10 ? '0' + i : i}`;
          rooms.push({ roomNumber, floor: f });
        }
      });
      return rooms;
    } else {
      const s = activeExternalStay;
      if (!s) return [];
      const rooms: { roomNumber: string; floor: string }[] = [];
      for (let i = 101; i <= 112; i++) {
        rooms.push({ roomNumber: `${i}`, floor: '1' });
      }
      return rooms;
    }
  }, [selectedFacilityType, activeHostel, activeExternalStay, selectedFloor]);

  // Unallocated participants
  const unallocatedParticipants = useMemo(() => {
    const allocatedParticipantIds = new Set(
      allocations.filter((a) => a.status !== 'vacated').map((a) => a.participant_id)
    );
    return participants.filter((p) => !allocatedParticipantIds.has(p.id));
  }, [participants, allocations]);

  // Handle Bed Allocation Attempt
  const handleAssignBed = async (participant: Participant, roomNumber: string, bedNumber: string) => {
    if (selectedFacilityType === 'external') {
      await allocateExternalStay(
        participant.id,
        selectedFacilityId,
        roomNumber,
        bedNumber,
        'Contingent overflow allocation authorized by hospitality desk',
        'Hospitality Lead'
      );
      setSelectedBedToAssign(null);
      return;
    }

    if (!activeHostel) return;

    let violationMessage = '';

    if (activeHostel.status === 'closed') {
      violationMessage = `Hostel ${activeHostel.name} is marked CLOSED under active emergency / disruption protocol.`;
    } else if (activeHostel.gender_allowed !== 'all' && activeHostel.gender_allowed !== participant.gender) {
      violationMessage = `GENDER SEGREGATION CONSTRAINT: ${activeHostel.name} is designated as ${activeHostel.gender_allowed.toUpperCase()} ONLY. Selected delegate is registered as ${participant.gender.toUpperCase()}.`;
    } else if (participant.accessibility_needs && !activeHostel.has_elevator && !roomNumber.startsWith('G') && !roomNumber.startsWith('0')) {
      violationMessage = `ACCESSIBILITY CONSTRAINT: ${participant.name} has recorded mobility/accessibility needs ("${participant.accessibility_note || 'Ground floor required'}"). Room ${roomNumber} is on an upper floor without elevator access.`;
    }

    if (violationMessage) {
      setPendingAllocation({
        participant,
        hostelId: activeHostel.id,
        roomNumber,
        bedNumber,
        warning: violationMessage,
        targetName: `${activeHostel.name} - Room ${roomNumber} (Bed ${bedNumber})`,
      });
      setIsModalOpen(true);
    } else {
      await allocateRoom(participant.id, activeHostel.id, roomNumber, bedNumber, false);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Accommodation Directorate
            </span>
            <span className="text-xs text-[#8F8982]">Strict Policy Enforcer</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Hostel & Overflow Allocation Matrix</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Real-time constraint engine enforcing gender segregation, wheelchair/ground-floor priority, and delegation grouping.
          </p>
        </div>

        <button
          onClick={() => {
            const res = autoAllocateAll();
            alert(`Auto-Allocation Complete: ${res.allocatedCount} delegate(s) assigned. ${res.violationsCount} constraint conflicts flagged.`);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#F6EFE6]" />
          <span>Auto-Allocate Engine</span>
        </button>
      </div>

      {/* Facility Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-3">
        {/* Hostel Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8F8982] mr-1 shrink-0">
            Campus Hostels:
          </span>
          {hostels.map((h) => {
            const isSelected = selectedFacilityType === 'hostel' && selectedFacilityId === h.id;
            const isClosed = h.status === 'closed';
            return (
              <button
                key={h.id}
                onClick={() => {
                  setSelectedFacilityType('hostel');
                  setSelectedFacilityId(h.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#A3703F] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E5DFD3]'
                } ${isClosed ? 'border-[#F0C9C7] text-[#7C2D2A]' : ''}`}
              >
                <span>{h.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#8F8982]'
                }`}>
                  {h.gender_allowed.toUpperCase()}
                </span>
                {isClosed && <span className="text-[10px] text-[#7C2D2A] font-bold">!CLOSED</span>}
              </button>
            );
          })}
        </div>

        {/* External Stay Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A3703F] mr-1 shrink-0">
            Overflow Stays:
          </span>
          {externalStays.map((s) => {
            const isSelected = selectedFacilityType === 'external' && selectedFacilityId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedFacilityType('external');
                  setSelectedFacilityId(s.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#A3703F] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E5DFD3]'
                }`}
              >
                <span>{s.name.split('(')[0]}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#8F8982]'}`}>
                  ({s.occupied_beds}/{s.total_capacity})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Facility Subheader */}
      <div className="bg-white border border-[#E5DFD3] p-4 rounded-2xl shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                {selectedFacilityType === 'hostel' ? activeHostel?.name : activeExternalStay?.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                selectedFacilityType === 'hostel'
                  ? activeHostel?.status === 'operational'
                    ? 'bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]'
                    : 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]'
                  : 'bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]'
              }`}>
                {selectedFacilityType === 'hostel' ? activeHostel?.status : activeExternalStay?.status}
              </span>
            </div>
            <p className="text-[#6B655E] mt-0.5 text-xs">
              {selectedFacilityType === 'hostel'
                ? `${activeHostel?.notes || ''} · Elevator: ${activeHostel?.has_elevator ? 'YES' : 'NO'}`
                : `${activeExternalStay?.location} · Contact: ${activeExternalStay?.contact_person} (${activeExternalStay?.contact_phone})`}
            </p>
          </div>
        </div>

        {/* Floor Filter */}
        {selectedFacilityType === 'hostel' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#8F8982] font-medium mr-1">Floor:</span>
            {['all', 'G', '1', '2', '3'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFloor === f
                    ? 'bg-[#A3703F] text-white'
                    : 'bg-[#FAF8F5] text-[#6B655E] hover:text-[#1A1A1A] border border-[#E5DFD3]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'G' ? 'Ground' : `Fl ${f}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Rooms on Left (3 cols) + Unallocated Queue on Right (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Room Grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B655E]">
            <div className="flex items-center gap-4">
              <span className="font-serif font-bold text-[#1A1A1A] text-sm">
                Room Layout ({roomsList.length} Rooms)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2D5A3E]"></span>
                  <span>Occupied</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E5DFD3]"></span>
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#A3703F]"></span>
                  <span>Override Logged</span>
                </span>
              </div>
            </div>

            {selectedBedToAssign && (
              <div className="text-[#7A4E1D] font-bold bg-[#FAF0E4] px-3 py-1 rounded-lg border border-[#EED5BC] text-xs">
                Select delegate on the right to assign to Room {selectedBedToAssign.roomNumber} ({selectedBedToAssign.bedNumber})
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {roomsList.map(({ roomNumber, floor }) => {
              const allocA = allocations.find(
                (a) =>
                  (selectedFacilityType === 'hostel'
                    ? a.hostel_id === selectedFacilityId
                    : a.external_stay_id === selectedFacilityId) &&
                  a.room_number === roomNumber &&
                  a.bed_number === 'A' &&
                  a.status !== 'vacated'
              );
              const partA = allocA ? participants.find((p) => p.id === allocA.participant_id) : null;
              const cntA = partA ? contingents.find((c) => c.id === partA.contingent_id) : null;

              const allocB = allocations.find(
                (a) =>
                  (selectedFacilityType === 'hostel'
                    ? a.hostel_id === selectedFacilityId
                    : a.external_stay_id === selectedFacilityId) &&
                  a.room_number === roomNumber &&
                  a.bed_number === 'B' &&
                  a.status !== 'vacated'
              );
              const partB = allocB ? participants.find((p) => p.id === allocB.participant_id) : null;
              const cntB = partB ? contingents.find((c) => c.id === partB.contingent_id) : null;

              const isGround = floor === 'G' || roomNumber.startsWith('G');

              return (
                <div
                  key={roomNumber}
                  className="bg-white border border-[#E5DFD3] rounded-2xl p-3.5 shadow-card hover:shadow-luxury transition-all"
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EFEBE3]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#1A1A1A] text-xs">Rm {roomNumber}</span>
                      {isGround && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]">
                          Ground
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8F8982] font-mono">Floor {floor}</span>
                  </div>

                  {/* Bed Slots */}
                  <div className="space-y-2">
                    {/* Bed A */}
                    <div
                      className={`p-2.5 rounded-xl text-xs transition-all border ${
                        partA
                          ? allocA?.is_override
                            ? 'bg-[#FAF0E4] border-[#EED5BC] text-[#7A4E1D]'
                            : cntA
                            ? contingentColorMap[cntA.id] || 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                            : 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                          : selectedBedToAssign?.roomNumber === roomNumber && selectedBedToAssign.bedNumber === 'A'
                          ? 'bg-[#FAF0E4] border-[#A3703F] text-[#7A4E1D] animate-pulse'
                          : 'bg-[#FAF8F5]/60 border-dashed border-[#D8D1C5] text-[#8F8982] hover:border-[#A3703F]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-[#8F8982]">Bed A</span>
                        {partA ? (
                          <button
                            onClick={() => deallocateParticipant(partA.id, 'Organizer deallocated bed')}
                            className="text-[10px] text-[#7C2D2A] hover:underline font-semibold"
                          >
                            Vacate
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedBedToAssign({ roomNumber, bedNumber: 'A' })}
                            className="text-[10px] text-[#A3703F] hover:underline font-semibold"
                          >
                            + Assign
                          </button>
                        )}
                      </div>

                      {partA ? (
                        <div>
                          <p className="font-bold text-[#1A1A1A] text-xs truncate">{partA.name}</p>
                          <p className="text-[10px] text-[#6B655E] truncate">{cntA?.name || 'Delegate'}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono px-1 rounded bg-white text-[#6B655E] border border-[#E5DFD3]">
                              {partA.gender}
                            </span>
                            {partA.accessibility_needs && (
                              <span className="text-[9px] px-1 rounded bg-[#FAF0E4] text-[#7A4E1D] font-bold">
                                Acc
                              </span>
                            )}
                            {allocA?.is_override && (
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

                    {/* Bed B */}
                    <div
                      className={`p-2.5 rounded-xl text-xs transition-all border ${
                        partB
                          ? allocB?.is_override
                            ? 'bg-[#FAF0E4] border-[#EED5BC] text-[#7A4E1D]'
                            : cntB
                            ? contingentColorMap[cntB.id] || 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                            : 'bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                          : selectedBedToAssign?.roomNumber === roomNumber && selectedBedToAssign.bedNumber === 'B'
                          ? 'bg-[#FAF0E4] border-[#A3703F] text-[#7A4E1D] animate-pulse'
                          : 'bg-[#FAF8F5]/60 border-dashed border-[#D8D1C5] text-[#8F8982] hover:border-[#A3703F]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-[#8F8982]">Bed B</span>
                        {partB ? (
                          <button
                            onClick={() => deallocateParticipant(partB.id, 'Organizer deallocated bed')}
                            className="text-[10px] text-[#7C2D2A] hover:underline font-semibold"
                          >
                            Vacate
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedBedToAssign({ roomNumber, bedNumber: 'B' })}
                            className="text-[10px] text-[#A3703F] hover:underline font-semibold"
                          >
                            + Assign
                          </button>
                        )}
                      </div>

                      {partB ? (
                        <div>
                          <p className="font-bold text-[#1A1A1A] text-xs truncate">{partB.name}</p>
                          <p className="text-[10px] text-[#6B655E] truncate">{cntB?.name || 'Delegate'}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono px-1 rounded bg-white text-[#6B655E] border border-[#E5DFD3]">
                              {partB.gender}
                            </span>
                            {partB.accessibility_needs && (
                              <span className="text-[9px] px-1 rounded bg-[#FAF0E4] text-[#7A4E1D] font-bold">
                                Acc
                              </span>
                            )}
                            {allocB?.is_override && (
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unallocated Delegates Drawer */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-luxury">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A3703F]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-sm">
                  Unallocated Delegates ({unallocatedParticipants.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8F8982] uppercase bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD3]">
                Pending
              </span>
            </div>

            <p className="text-xs text-[#6B655E] mb-3">
              Click a delegate to allocate to{' '}
              {selectedBedToAssign
                ? `Room ${selectedBedToAssign.roomNumber} (${selectedBedToAssign.bedNumber})`
                : 'first available room'}
            </p>

            {unallocatedParticipants.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-center">
                <CheckCircle className="w-6 h-6 text-[#2D5A3E] mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-[#1A1A1A]">All Delegates Allocated</p>
                <p className="text-[10px] text-[#8F8982] mt-0.5">100% bed occupancy reached.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {unallocatedParticipants.map((p) => {
                  const cnt = contingents.find((c) => c.id === p.contingent_id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        const targetRoom = selectedBedToAssign?.roomNumber || '101';
                        const targetBed = selectedBedToAssign?.bedNumber || 'A';
                        handleAssignBed(p, targetRoom, targetBed);
                      }}
                      className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-white border border-[#E5DFD3] hover:border-[#A3703F] cursor-pointer transition-all group text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A] group-hover:text-[#A3703F]">{p.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white text-[#6B655E] border border-[#E5DFD3]">
                          {p.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B655E] mt-0.5 truncate">{cnt?.name}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-[#6B655E] border border-[#E5DFD3] capitalize font-medium">
                          {p.role}
                        </span>
                        {p.accessibility_needs && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF0E4] text-[#7A4E1D] font-bold border border-[#EED5BC]">
                            ♿ Accessibility Req
                          </span>
                        )}
                        {p.dietary_requirements !== 'none' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EAF3EC] text-[#2D5A3E] uppercase font-bold border border-[#C7E2CE]">
                            {p.dietary_requirements}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Override Justification Modal */}
      {pendingAllocation && (
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
    </div>
  );
};
