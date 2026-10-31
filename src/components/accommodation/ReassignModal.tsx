'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowRightLeft,
  Building,
  Hotel,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Participant, Hostel, ExternalStay, AccommodationAllocation } from '@/types/database';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  currentLocation: string;
  hostels: Hostel[];
  externalStays: ExternalStay[];
  allocations: AccommodationAllocation[];
  participants: Participant[];
  onConfirmReassign: (
    participantId: string,
    facilityType: 'hostel' | 'external',
    facilityId: string,
    roomNumber: string,
    bedNumber: string,
    reason: string
  ) => Promise<void>;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  onClose,
  participant,
  currentLocation,
  hostels,
  externalStays,
  allocations,
  participants,
  onConfirmReassign
}) => {
  const [facilityType, setFacilityType] = useState<'hostel' | 'external'>('hostel');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('A');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default facility when modal opens or facilityType changes
  React.useEffect(() => {
    if (facilityType === 'hostel') {
      const defaultHostel = hostels.find((h) =>
        h.status !== 'closed' && (h.gender_allowed === 'all' || h.gender_allowed === participant?.gender)
      ) || hostels[0];
      setSelectedFacilityId(defaultHostel?.id || '');
    } else {
      setSelectedFacilityId(externalStays[0]?.id || '');
    }
    setSelectedRoom('');
    setSelectedBed('A');
    setError(null);
  }, [facilityType, participant, hostels, externalStays]);

  // Generate available rooms and validate gender compatibility
  const roomsAvailability = useMemo(() => {
    if (!participant || !selectedFacilityId) return [];

    const partGender = participant.gender;

    if (facilityType === 'hostel') {
      const h = hostels.find((item) => item.id === selectedFacilityId);
      if (!h) return [];

      const floors = ['G', '1', '2', '3'].slice(0, h.floor_count + 1);
      const rooms: any[] = [];

      floors.forEach((f) => {
        for (let i = 1; i <= 8; i++) {
          const roomNumber = `${f}${i < 10 ? '0' + i : i}`;

          // Find current occupants in this room
          const allocA = allocations.find(
            (a) => a.hostel_id === h.id && a.room_number === roomNumber && a.bed_number === 'A' && a.status !== 'vacated'
          );
          const allocB = allocations.find(
            (a) => a.hostel_id === h.id && a.room_number === roomNumber && a.bed_number === 'B' && a.status !== 'vacated'
          );

          const occupantA = allocA ? participants.find((p) => p.id === allocA.participant_id) : null;
          const occupantB = allocB ? participants.find((p) => p.id === allocB.participant_id) : null;

          // Check gender conflict
          const roomGender = occupantA?.gender || occupantB?.gender || null;
          const hasGenderConflict = roomGender !== null && roomGender !== partGender;

          // Check accessibility match
          const isAccessibleFloor = f === 'G' || h.has_elevator;
          const accessibilityConflict = participant.accessibility_needs && !isAccessibleFloor;

          const isBedAFree = !allocA;
          const isBedBFree = !allocB;

          rooms.push({
            roomNumber,
            floor: f,
            occupantA,
            occupantB,
            isBedAFree,
            isBedBFree,
            hasGenderConflict,
            accessibilityConflict,
            roomGender,
            canSelect: (!hasGenderConflict && !accessibilityConflict) && (isBedAFree || isBedBFree)
          });
        }
      });
      return rooms;
    } else {
      const s = externalStays.find((item) => item.id === selectedFacilityId);
      if (!s) return [];

      const rooms: any[] = [];
      for (let i = 101; i <= 112; i++) {
        const roomNumber = String(i);

        const allocA = allocations.find(
          (a) => a.external_stay_id === s.id && a.room_number === roomNumber && a.bed_number === 'A' && a.status !== 'vacated'
        );
        const allocB = allocations.find(
          (a) => a.external_stay_id === s.id && a.room_number === roomNumber && a.bed_number === 'B' && a.status !== 'vacated'
        );

        const occupantA = allocA ? participants.find((p) => p.id === allocA.participant_id) : null;
        const occupantB = allocB ? participants.find((p) => p.id === allocB.participant_id) : null;

        const roomGender = occupantA?.gender || occupantB?.gender || null;
        const hasGenderConflict = roomGender !== null && roomGender !== partGender;

        const isBedAFree = !allocA;
        const isBedBFree = !allocB;

        rooms.push({
          roomNumber,
          floor: '1',
          occupantA,
          occupantB,
          isBedAFree,
          isBedBFree,
          hasGenderConflict,
          accessibilityConflict: false,
          roomGender,
          canSelect: !hasGenderConflict && (isBedAFree || isBedBFree)
        });
      }
      return rooms;
    }
  }, [participant, facilityType, selectedFacilityId, hostels, externalStays, allocations, participants]);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      setError('Please select a destination room.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError('A valid operational reason (minimum 5 characters) is required for reallocations.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmReassign(
        participant.id,
        facilityType,
        selectedFacilityId,
        selectedRoom,
        selectedBed,
        reason.trim()
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reallocate delegate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5DFD3] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Reallocate Delegate Room</h3>
              <p className="text-xs text-[#6B655E]">Move delegate between campus hostels or overflow stays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EFEBE3] text-[#8F8982] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Delegate Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#A3703F]">{participant.id}</span>
                <span className="font-serif font-bold text-[#1A1A1A] text-sm ml-2">{participant.name}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-[#6B655E] border border-[#E5DFD3]">
                {participant.gender}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B655E]">
              <span>Current Allocation: <strong className="text-[#1A1A1A]">{currentLocation}</strong></span>
              {participant.accessibility_needs && (
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                  ♿ Ground Floor Req
                </span>
              )}
            </div>
          </div>

          {/* Facility Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8F8982] mb-1.5">
              Target Facility Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFacilityType('hostel')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  facilityType === 'hostel'
                    ? 'bg-[#A3703F] text-white border-[#A3703F] shadow-sm'
                    : 'bg-white text-[#6B655E] border-[#E5DFD3] hover:bg-[#FAF8F5]'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Campus Hostels</span>
              </button>
              <button
                type="button"
                onClick={() => setFacilityType('external')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  facilityType === 'external'
                    ? 'bg-[#A3703F] text-white border-[#A3703F] shadow-sm'
                    : 'bg-white text-[#6B655E] border-[#E5DFD3] hover:bg-[#FAF8F5]'
                }`}
              >
                <Hotel className="w-4 h-4" />
                <span>External Overflow Stays</span>
              </button>
            </div>
          </div>

          {/* Select Specific Facility */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8F8982] mb-1.5">
              Select {facilityType === 'hostel' ? 'Hostel' : 'External Property'}
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => {
                setSelectedFacilityId(e.target.value);
                setSelectedRoom('');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#A3703F]"
            >
              {facilityType === 'hostel'
                ? hostels.map((h) => {
                    const isGenderMismatch = h.gender_allowed !== 'all' && h.gender_allowed !== participant.gender;
                    return (
                      <option
                        key={h.id}
                        value={h.id}
                        disabled={h.status === 'closed' || isGenderMismatch}
                      >
                        {h.name} ({h.gender_allowed.toUpperCase()}) {isGenderMismatch ? ' - Gender Incompatible' : ''} {h.status === 'closed' ? ' - CLOSED' : ''}
                      </option>
                    );
                  })
                : externalStays.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupied_beds}/{s.total_capacity} beds occupied)
                    </option>
                  ))}
            </select>
          </div>

          {/* Available Rooms Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">
                Select Destination Room & Bed
              </label>
              <span className="text-[10px] text-[#6B655E]">Strict Single-Gender Enforced</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 border border-[#E5DFD3] rounded-xl bg-[#FAF8F5]">
              {roomsAvailability.map((r) => {
                const isSelected = selectedRoom === r.roomNumber;
                return (
                  <button
                    key={r.roomNumber}
                    type="button"
                    disabled={!r.canSelect}
                    onClick={() => {
                      setSelectedRoom(r.roomNumber);
                      setSelectedBed(r.isBedAFree ? 'A' : 'B');
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[#A3703F] text-white border-[#A3703F] shadow-xs'
                        : r.canSelect
                        ? 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">Rm {r.roomNumber}</span>
                      <span className="text-[9px]">Fl {r.floor}</span>
                    </div>
                    <div className="mt-1 text-[10px] flex items-center justify-between">
                      <span>{r.isBedAFree && r.isBedBFree ? '2 Free' : '1 Free'}</span>
                      {r.hasGenderConflict && <span className="text-red-600 font-bold">Opp. Gender</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bed Choice in Selected Room */}
          {selectedRoom && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8F8982] mb-1.5">
                Bed Choice in Room {selectedRoom}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['A', 'B'].map((bed) => {
                  const room = roomsAvailability.find((r) => r.roomNumber === selectedRoom);
                  const isFree = bed === 'A' ? room?.isBedAFree : room?.isBedBFree;
                  return (
                    <button
                      key={bed}
                      type="button"
                      disabled={!isFree}
                      onClick={() => setSelectedBed(bed)}
                      className={`p-2.5 rounded-xl border text-center font-mono font-bold transition-all ${
                        selectedBed === bed
                          ? 'bg-[#A3703F] text-white border-[#A3703F]'
                          : isFree
                          ? 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD3] text-[#1A1A1A]'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Bed {bed} ({isFree ? 'Available' : 'Occupied'})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Operational Reason */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8F8982] mb-1">
              Operational Reason for Transfer <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Moved to keep contingent members together / Accessibility requirement reassignment"
              className="w-full p-2.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DFD3] bg-white hover:bg-[#FAF8F5] text-[#6B655E] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoom}
              className="px-4 py-2 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <span>Confirm Reassignment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
