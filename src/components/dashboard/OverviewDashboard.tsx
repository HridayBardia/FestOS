'use client';

import React from 'react';
import {
  Hotel,
  Users,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Building,
  Radio
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { formatISTTime } from '@/lib/formatters';

interface OverviewDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenDisruptions: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigateTab, onOpenDisruptions }) => {
  const {
    hostels,
    externalStays,
    participantsCount,
    checkedInCount,
    contingents,
    clashes,
    vendors,
    auditLogs,
    autoAllocateAll,
    updateEventVenue,
    isUsingRemoteSupabase
  } = useFest();

  const totalHostelCapacity = hostels.reduce((sum, h) => sum + h.total_capacity, 0);
  const occupiedHostelBeds = hostels.reduce((sum, h) => sum + h.occupied_beds, 0);
  const totalExternalCapacity = externalStays.reduce((sum, s) => sum + s.total_capacity, 0);
  const occupiedExternalBeds = externalStays.reduce((sum, s) => sum + s.occupied_beds, 0);

  const totalBeds = totalHostelCapacity + totalExternalCapacity;
  const totalOccupied = occupiedHostelBeds + occupiedExternalBeds;
  const bedOccupancyRate = Math.round((totalOccupied / (totalBeds || 1)) * 100);

  const checkInRate = Math.round((checkedInCount / (participantsCount || 1)) * 100);
  const vendorAlerts = vendors.filter((v) => v.compliance_status !== 'compliant');

  const arrivedContingents = contingents.filter((c) => c.status === 'arrived');
  const delayedContingents = contingents.filter((c) => c.status === 'delayed');

  const handleRunAutoAllocation = () => {
    const res = autoAllocateAll();
    alert(`Smart Auto-Allocation Engine: ${res.allocatedCount} participant(s) assigned. ${res.violationsCount} constraint conflicts flagged.`);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Masthead Banner */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-8 shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F6EFE6]/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                Festival Directorate
              </span>
              <span className="text-xs text-[#8F8982] font-mono">
                {isUsingRemoteSupabase ? 'Supabase Live Connected' : 'Command Center Active'}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Aarohan 2026 Executive Overview
            </h2>
            <p className="text-sm text-[#6B655E] mt-1.5 leading-relaxed">
              Centralized operational command across 8 premier B-School delegations, 5 on-campus residences, 6 event venues, and external emergency overflow stays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunAutoAllocation}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-bold border border-[#E5DFD3] shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#A3703F]" />
              <span>Auto-Allocate</span>
            </button>
            <button
              onClick={onOpenDisruptions}
              className="px-4 py-2.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Flame className="w-4 h-4 text-[#F6EFE6]" />
              <span>Jury Injections</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 High-Level Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Bed Occupancy */}
        <div
          onClick={() => onNavigateTab('accommodation')}
          className="bg-white border border-[#E5DFD3] hover:border-[#A3703F]/50 rounded-2xl p-5 shadow-luxury transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Hostel Bed Occupancy</span>
            <div className="p-2 rounded-xl bg-[#F6EFE6] text-[#A3703F] group-hover:scale-105 transition-transform">
              <Hotel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#1A1A1A]">{bedOccupancyRate}%</span>
            <span className="text-xs text-[#8F8982] font-mono">
              ({totalOccupied}/{totalBeds} beds)
            </span>
          </div>
          <div className="mt-3 w-full bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#A3703F] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, bedOccupancyRate)}%` }}
            ></div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#6B655E]">
            <span>Campus: {occupiedHostelBeds}/{totalHostelCapacity}</span>
            <span className="text-[#A3703F] font-semibold">Overflow: {occupiedExternalBeds}</span>
          </div>
        </div>

        {/* Metric 2: Checked-In Participants (2,836 count) */}
        <div
          onClick={() => onNavigateTab('participants')}
          className="bg-white border border-[#E5DFD3] hover:border-[#A3703F]/50 rounded-2xl p-5 shadow-luxury transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Checked-in Delegates</span>
            <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#2D5A3E] group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#1A1A1A]">{checkedInCount.toLocaleString()}</span>
            <span className="text-xs text-[#8F8982] font-mono">
              / {participantsCount.toLocaleString()} ({checkInRate}%)
            </span>
          </div>
          <div className="mt-3 w-full bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#2D5A3E] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, checkInRate)}%` }}
            ></div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#6B655E]">
            <span>{arrivedContingents.length} Delegations Arrived</span>
            <span className="text-[#7A4E1D] font-semibold">{delayedContingents.length} Delayed</span>
          </div>
        </div>

        {/* Metric 3: Active Schedule Clashes */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className={`border rounded-2xl p-5 shadow-luxury transition-all cursor-pointer group ${
            clashes.length > 0
              ? 'bg-[#FAECEB]/40 border-[#F0C9C7] hover:border-[#7C2D2A]'
              : 'bg-white border-[#E5DFD3] hover:border-[#A3703F]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Schedule Clashes</span>
            <div className={`p-2 rounded-xl group-hover:scale-105 transition-transform ${
              clashes.length > 0 ? 'bg-[#FAECEB] text-[#7C2D2A]' : 'bg-[#FAF8F5] text-[#8F8982]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-serif font-bold ${clashes.length > 0 ? 'text-[#7C2D2A]' : 'text-[#1A1A1A]'}`}>
              {clashes.length}
            </span>
            <span className="text-xs text-[#8F8982] font-mono">active conflicts</span>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              clashes.length > 0 ? 'bg-[#FAECEB] text-[#7C2D2A]' : 'bg-[#EAF3EC] text-[#2D5A3E]'
            }`}>
              {clashes.length > 0 ? 'Attention Needed' : 'No Venue Conflicts'}
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-[#8F8982] flex items-center justify-between">
            <span>Review clash detector</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4: Vendor & Health Compliance */}
        <div
          onClick={() => onNavigateTab('logistics')}
          className="bg-white border border-[#E5DFD3] hover:border-[#A3703F]/50 rounded-2xl p-5 shadow-luxury transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Vendor Compliance</span>
            <div className="p-2 rounded-xl bg-[#FAF0E4] text-[#7A4E1D] group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-serif font-bold ${vendorAlerts.length > 0 ? 'text-[#7A4E1D]' : 'text-[#2D5A3E]'}`}>
              {vendorAlerts.length}
            </span>
            <span className="text-xs text-[#8F8982] font-mono">compliance notices</span>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              vendorAlerts.length > 0 ? 'bg-[#FAF0E4] text-[#7A4E1D]' : 'bg-[#EAF3EC] text-[#2D5A3E]'
            }`}>
              {vendorAlerts.length > 0 ? '1 Breached, 1 Warning' : '100% Cleared'}
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-[#8F8982] flex items-center justify-between">
            <span>Hygiene & inventory status</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Clashes Radar + Accommodations Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Clashes & Delegations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Clashes Card */}
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#7C2D2A]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">
                  Active Schedule & Venue Clashes ({clashes.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs text-[#A3703F] hover:text-[#8C6D36] font-semibold flex items-center gap-1"
              >
                <span>Full Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {clashes.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
                <CheckCircle2 className="w-7 h-7 text-[#2D5A3E] mx-auto mb-2" />
                <p className="text-[#1A1A1A] text-sm font-semibold">Zero Active Clashes Detected</p>
                <p className="text-xs text-[#6B655E] mt-1">All events, participants, and venues are synchronized.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clashes.map((clash) => (
                  <div
                    key={clash.id}
                    className="p-4 rounded-xl bg-[#FAECEB]/40 border border-[#F0C9C7] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]">
                          {clash.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-[#1A1A1A]">{clash.title}</h4>
                      </div>
                      <p className="text-xs text-[#6B655E] mt-1.5 leading-relaxed">{clash.description}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {clash.type === 'venue_overlap' && (
                        <button
                          onClick={() => {
                            updateEventVenue(
                              clash.eventIds[1],
                              'ven-01',
                              'Emergency Clash Mitigation: Shifted to Central Auditorium',
                              'Samarth Kulkarni (Ops Head)'
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                        >
                          Shift to Audi
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateTab('schedule')}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-medium border border-[#E5DFD3] transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contingent Arrival Flow */}
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#A3703F]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">
                  Participating Delegations ({contingents.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('participants')}
                className="text-xs text-[#A3703F] hover:text-[#8C6D36] font-semibold flex items-center gap-1"
              >
                <span>View Rosters</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contingents.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A1A1A]">{c.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        c.status === 'arrived'
                          ? 'bg-[#EAF3EC] text-[#2D5A3E]'
                          : c.status === 'delayed'
                          ? 'bg-[#FAF0E4] text-[#7A4E1D]'
                          : 'bg-[#F6EFE6] text-[#A3703F]'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B655E] mt-0.5 truncate">{c.college}</p>
                    <p className="text-[10px] text-[#8F8982] mt-1 font-mono">
                      Lead: {c.leader_name} · {c.leader_phone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-bold text-[#1A1A1A] text-sm">{c.total_members}</span>
                    <span className="block text-[10px] text-[#8F8982]">delegates</span>
                    <span className="block text-[10px] text-[#A3703F] font-semibold">{c.male_count}M / {c.female_count}F</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Hostel Breakdown & Audit Logs */}
        <div className="space-y-6">
          {/* Hostel Occupancy Card */}
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Hotel className="w-4 h-4 text-[#A3703F]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Hostel Capacities</h3>
              </div>
              <button
                onClick={() => onNavigateTab('accommodation')}
                className="text-xs text-[#A3703F] hover:text-[#8C6D36] font-semibold"
              >
                Room Grid
              </button>
            </div>

            <div className="space-y-3">
              {hostels.map((h) => {
                const pct = Math.round((h.occupied_beds / (h.total_capacity || 1)) * 100);
                const isClosed = h.status === 'closed';
                return (
                  <div key={h.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isClosed ? 'text-[#7C2D2A] line-through' : 'text-[#1A1A1A]'}`}>
                          {h.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white text-[#6B655E] border border-[#E5DFD3]">
                          {h.gender_allowed}
                        </span>
                        {isClosed && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FAECEB] text-[#7C2D2A]">
                            CLOSED
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#1A1A1A]">
                        {h.occupied_beds}/{h.total_capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F4F1EA] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isClosed ? 'bg-[#7C2D2A]' : pct > 85 ? 'bg-[#7A4E1D]' : 'bg-[#A3703F]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* External Overflow Summary */}
            <div className="mt-4 pt-4 border-t border-[#E5DFD3]">
              <div className="flex items-center justify-between text-xs text-[#8F8982] mb-2 font-bold uppercase tracking-wider">
                <span>External Overflow Stays</span>
                <span className="text-[#A3703F]">{occupiedExternalBeds} Reserved</span>
              </div>
              {externalStays.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1 text-[#6B655E]">
                  <span className="truncate pr-2">{s.name.split('(')[0]}</span>
                  <span className="font-mono text-[11px] text-[#1A1A1A] font-medium shrink-0">
                    {s.occupied_beds}/{s.total_capacity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Logs Stream */}
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#A3703F]" />
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Overrides Audit Log</h3>
              </div>
              <span className="text-[10px] font-mono text-[#8F8982] uppercase bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD3]">
                PostgreSQL
              </span>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#8F8982] mb-1 font-mono">
                    <span className="font-bold text-[#A3703F]">{log.action_type.replace('_', ' ').toUpperCase()}</span>
                    <span suppressHydrationWarning>{formatISTTime(log.timestamp)}</span>
                  </div>
                  <p className="text-[#1A1A1A] font-medium text-[11px] line-clamp-2 leading-relaxed">{log.reason}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#6B655E]">
                    <span>By: {log.actor}</span>
                    <span className="text-[#2D5A3E] font-semibold">Auth: {log.approved_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
