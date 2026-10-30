'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { formatISTTime } from '@/lib/formatters';

export const ScheduleClashView: React.FC = () => {
  const {
    events,
    venues,
    clashes,
    updateEventVenue
  } = useFest();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVenueFilter, setSelectedVenueFilter] = useState<string>('all');

  const [shiftTargetEvent, setShiftTargetEvent] = useState<string | null>(null);
  const [newVenueChoice, setNewVenueChoice] = useState<string>('');
  const [shiftReason, setShiftReason] = useState<string>('');
  const [authorizedOfficer, setAuthorizedOfficer] = useState<string>('Samarth Kulkarni (Ops Head)');

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    if (selectedVenueFilter !== 'all' && ev.venue_id !== selectedVenueFilter) return false;
    return true;
  });

  const handleExecuteShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTargetEvent || !newVenueChoice) return;
    updateEventVenue(
      shiftTargetEvent,
      newVenueChoice,
      shiftReason || 'Timing/Venue overlap mitigation authorized during live festival operations',
      authorizedOfficer
    );
    setShiftTargetEvent(null);
    setNewVenueChoice('');
    setShiftReason('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Events & Scheduling Directorate
            </span>
            <span className="text-xs text-[#8F8982]">Live Conflict Detection</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Event Schedule & Clash Matrix</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Real-time matrix cross-referencing stage timings, venue occupancy, and participant commitments.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-bold text-xs shrink-0 ${
          clashes.length > 0
            ? 'bg-[#FAECEB] border-[#F0C9C7] text-[#7C2D2A]'
            : 'bg-[#EAF3EC] border-[#C7E2CE] text-[#2D5A3E]'
        }`}>
          <ShieldAlert className="w-4 h-4" />
          <span>{clashes.length} Active Conflict(s) Flagged</span>
        </div>
      </div>

      {/* High-Priority Clash Diagnostics Banner */}
      {clashes.length > 0 && (
        <div className="bg-[#FAECEB]/40 border border-[#F0C9C7] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#7C2D2A]">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                Operational Clashes Requiring Reassignment ({clashes.length})
              </h3>
            </div>
            <span className="text-xs text-[#7C2D2A] font-mono">Live WebSocket Alert</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clashes.map((clash) => {
              const involvedEvents = events.filter((e) => clash.eventIds.includes(e.id));
              return (
                <div
                  key={clash.id}
                  className="bg-white border border-[#F0C9C7] rounded-xl p-5 shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]">
                        {clash.type.replace('_', ' ')}
                      </span>
                      <span className="text-[#7C2D2A] font-mono text-[10px] uppercase font-bold">
                        SEVERITY: {clash.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">{clash.title}</h4>
                    <p className="text-xs text-[#6B655E] leading-relaxed mb-3">{clash.description}</p>

                    <div className="space-y-1.5 text-xs text-[#6B655E]">
                      {involvedEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
                          <span className="font-semibold text-[#1A1A1A]">{ev.title}</span>
                          <span className="font-mono text-[11px] text-[#A3703F]" suppressHydrationWarning>
                            {formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5DFD3] flex items-center justify-end">
                    <button
                      onClick={() => {
                        setShiftTargetEvent(clash.eventIds[clash.eventIds.length - 1]);
                        setNewVenueChoice('ven-01');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F6EFE6]" />
                      <span>Shift Venue / Reallocate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="bg-white border border-[#E5DFD3] p-4 rounded-2xl shadow-luxury flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[#8F8982] font-bold uppercase tracking-wider text-[11px] mr-1">Category:</span>
          {['all', 'flagship', 'cultural', 'management', 'sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#A3703F] text-white shadow-sm'
                  : 'bg-[#FAF8F5] hover:bg-white text-[#6B655E] border border-[#E5DFD3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#8F8982] font-medium">Venue:</span>
          <select
            value={selectedVenueFilter}
            onChange={(e) => setSelectedVenueFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
          >
            <option value="all">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.capacity} pax)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((ev) => {
          const venue = venues.find((v) => v.id === ev.venue_id);
          const hasClash = clashes.some((c) => c.eventIds.includes(ev.id));
          const capacityUsed = ev.registered_participants_count || 0;
          const venueCapacity = venue?.capacity || 100;
          const capacityPct = Math.round((capacityUsed / (venueCapacity || 1)) * 100);

          return (
            <div
              key={ev.id}
              className={`rounded-2xl border p-5 shadow-luxury transition-all flex flex-col justify-between ${
                hasClash
                  ? 'bg-[#FAECEB]/30 border-[#F0C9C7]'
                  : 'bg-white border-[#E5DFD3]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                    {ev.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasClash && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]">
                        CLASH ACTIVE
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      ev.status === 'scheduled'
                        ? 'bg-[#EAF3EC] text-[#2D5A3E]'
                        : 'bg-[#FAF0E4] text-[#7A4E1D]'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-[#1A1A1A] text-lg tracking-tight mb-2">{ev.title}</h3>

                <div className="flex items-center gap-2 text-xs text-[#6B655E] mb-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#A3703F] shrink-0" />
                  <span suppressHydrationWarning>
                    {formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)} IST
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6B655E] mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#A3703F] shrink-0" />
                  <span className="font-semibold text-[#1A1A1A]">{venue?.name || 'TBA'}</span>
                  <span className="text-[10px] font-mono text-[#8F8982]">({venue?.type})</span>
                </div>

                {/* Capacity Gauge */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs mb-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#8F8982]">Venue Capacity Utilization:</span>
                    <span className={`font-mono font-bold ${capacityPct > 100 ? 'text-[#7C2D2A]' : 'text-[#1A1A1A]'}`}>
                      {capacityUsed}/{venueCapacity} ({capacityPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPct > 100
                          ? 'bg-[#7C2D2A]'
                          : capacityPct > 80
                          ? 'bg-[#7A4E1D]'
                          : 'bg-[#2D5A3E]'
                      }`}
                      style={{ width: `${Math.min(100, capacityPct)}%` }}
                    ></div>
                  </div>
                </div>

                {ev.equipment_needed && ev.equipment_needed.length > 0 && (
                  <div className="text-[11px] text-[#6B655E]">
                    <span className="font-semibold text-[#1A1A1A]">AV Requisites: </span>
                    <span>{ev.equipment_needed.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
                <span className="text-[11px] text-[#8F8982] font-mono">
                  Team: {ev.min_team_size}-{ev.max_team_size}
                </span>
                <button
                  onClick={() => {
                    setShiftTargetEvent(ev.id);
                    setNewVenueChoice(ev.venue_id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-semibold border border-[#E5DFD3] transition-colors"
                >
                  Shift Venue
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift Venue Modal */}
      {shiftTargetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-[#1A1A1A]">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-1">Emergency Venue Reassignment</h3>
            <p className="text-xs text-[#6B655E] mb-4">
              Reallocating venue will automatically update Supabase and re-compute conflict matrices in real time.
            </p>

            <form onSubmit={handleExecuteShift} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Target Event:</label>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] font-bold text-[#1A1A1A]">
                  {events.find((e) => e.id === shiftTargetEvent)?.title}
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">New Venue Selection *</label>
                <select
                  value={newVenueChoice}
                  onChange={(e) => setNewVenueChoice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Capacity: {v.capacity} | {v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">
                  Justification / Operational Reason for Audit Log *
                </label>
                <textarea
                  rows={2}
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                  placeholder="e.g. Inclement weather at Amphitheatre; shifting crowd indoors to Central Auditorium."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">Authorizing Lead *</label>
                <select
                  value={authorizedOfficer}
                  onChange={(e) => setAuthorizedOfficer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
                >
                  <option value="Samarth Kulkarni (Ops Head)">Samarth Kulkarni (Ops Head)</option>
                  <option value="Kunal Chauhan (Events Lead)">Kunal Chauhan (Events Lead)</option>
                  <option value="Prof. Animesh Sen (Director)">Prof. Animesh Sen (Director)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShiftTargetEvent(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F5] text-[#6B655E] hover:bg-[#F4F1EA] font-semibold border border-[#E5DFD3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white font-bold shadow-md shadow-[#A3703F]/20"
                >
                  Reassign Venue & Commit Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
