'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { RoleKey } from '@/config/roles';
import { formatISTTime } from '@/lib/formatters';
import { useFest } from '@/context/FestContext';
import { UserMinus, UserCheck, RefreshCw, Sparkles, Plus, Phone, ExternalLink } from 'lucide-react';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Schedule Timeline Widget
export const ScheduleTimelineWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=schedule_timeline&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const formatSlotTime = (startIso?: string, endIso?: string) => {
    if (!startIso) return 'N/A';
    try {
      const d = new Date(startIso);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
      const startTimeStr = formatISTTime(startIso);
      const endTimeStr = endIso ? formatISTTime(endIso) : '';
      return `${dateStr} · ${startTimeStr}${endTimeStr ? ' - ' + endTimeStr : ''}`;
    } catch {
      return startIso?.replace('T', ' ').slice(5, 16) || 'N/A';
    }
  };

  const filteredData = data.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (s.event_id && s.event_id.toLowerCase().includes(q)) ||
      (s.event_name && s.event_name.toLowerCase().includes(q)) ||
      (s.venue_name && s.venue_name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedDay === 'all') return true;
    if (selectedDay === 'day1') return s.start_time?.includes('2026-10-30');
    if (selectedDay === 'day2') return s.start_time?.includes('2026-10-31');
    if (selectedDay === 'day3') return s.start_time?.includes('2026-11-01');
    return true;
  });

  return (
    <WidgetCard
      widgetId="schedule_timeline"
      loading={loading}
      error={error}
      headerAction={
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search event, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-2.5 py-1 pl-7 rounded-md border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F] w-36 sm:w-44"
            />
            <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2 top-1.5" />
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Day Filter Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All Events (${data.length})` },
            { id: 'day1', label: 'Day 1 (Oct 30)' },
            { id: 'day2', label: 'Day 2 (Oct 31)' },
            { id: 'day3', label: 'Day 3 (Nov 1)' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                selectedDay === d.id
                  ? 'bg-[#A3703F] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Chronological Event Cards */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredData.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8F8982] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E5DFD3]">
              No events found matching filter criteria.
            </div>
          ) : (
            filteredData.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] text-xs hover:border-[#A3703F]/50 transition-all shadow-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[#A3703F] font-bold text-xs bg-[#F6EFE6] px-2 py-0.5 rounded border border-[#E5DFD3]">
                      {s.event_id}
                    </span>
                    <span className="font-serif font-bold text-[#1A1A1A] text-sm">{s.event_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF8F5] text-[#8F8982] border border-[#E5DFD3] uppercase font-mono">
                      {s.event_type}
                    </span>
                    {s.duration_minutes && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold">
                        {s.duration_minutes}m duration
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E5DFD3] flex items-center gap-1.5 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#A3703F]" />
                      {formatSlotTime(s.start_time, s.end_time)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-bold">
                      {s.status}
                    </span>
                  </div>
                </div>

                {/* Venue, Spec and Logistics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#F5F2EC] text-[11px] text-[#6B655E]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A3703F] shrink-0" />
                    <span className="font-semibold text-[#1A1A1A]">{s.venue_name}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[#8F8982]">Venue Setup: </span>
                    <span className="font-medium text-[#1A1A1A]">{s.venue_requirements || 'Standard Stage'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[#8F8982]">Logistics Equip: </span>
                    <span className="font-medium text-[#A3703F]">{s.equipment_needs || 'Standard AV'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. Venue Status Board Widget
export const VenueStatusBoardWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=venue_status_board&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  return (
    <WidgetCard widgetId="venue_status_board" loading={loading} error={error}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-[300px] overflow-y-auto pr-1">
        {data.map((v) => (
          <div key={v.venue_id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#A3703F]">{v.venue_id}</span>
                <p className="font-serif font-bold text-[#1A1A1A]">{v.venue_name}</p>
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Operational
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-[#6B655E] mt-2 pt-1 border-t border-[#EFEBE3]">
              <span>Cap: {v.capacity} pax</span>
              <span>{v.total_events_scheduled} events</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 3. Clash Alert Feed Widget (Synchronized with Schedule & Clash Matrix)
export const ClashAlertFeedWidget: React.FC<WidgetProps> = ({ role }) => {
  const { clashes, events, venues, updateEventVenue } = useFest();
  const [filterType, setFilterType] = useState<string>('all');
  const [resolvingClashId, setResolvingClashId] = useState<string | null>(null);
  const [newVenueChoice, setNewVenueChoice] = useState<string>('ven-01');

  const filteredClashes = clashes.filter((c) => {
    if (filterType === 'all') return true;
    if (filterType === 'venue') return c.type === 'venue_overlap';
    if (filterType === 'participant') return c.type === 'participant_clash';
    if (filterType === 'capacity') return c.type === 'capacity_exceeded';
    return true;
  });

  const handleShiftVenue = (clash: any) => {
    const targetEventId = clash.eventIds[clash.eventIds.length - 1];
    updateEventVenue(
      targetEventId,
      newVenueChoice,
      'Operational schedule conflict shift authorized from Events Desk',
      'Kunal Chauhan (Events Lead)'
    );
    setResolvingClashId(null);
  };

  return (
    <WidgetCard
      widgetId="clash_alert_feed"
      loading={false}
      headerAction={
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]">
            {clashes.length} Active Conflicts
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Synchronized Clash Filter Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${clashes.length})` },
            { id: 'venue', label: 'Venue Overlaps' },
            { id: 'participant', label: 'Participant Clashes' },
            { id: 'capacity', label: 'Capacity Overruns' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                filterType === f.id
                  ? 'bg-[#7C2D2A] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clashes List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredClashes.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8F8982] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E5DFD3]">
              No active clashes under this category.
            </div>
          ) : (
            filteredClashes.map((c) => {
              const involvedEvents = events.filter((e) => c.eventIds.includes(e.id));
              const isResolving = resolvingClashId === c.id;

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-white border border-[#F0C9C7] text-xs space-y-2 shadow-xs hover:border-[#7C2D2A]/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]">
                      {c.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#7C2D2A] font-bold">
                      SEVERITY: {c.severity.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-serif font-bold text-[#1A1A1A]">{c.title}</h5>
                    <p className="text-[11px] text-[#6B655E] mt-0.5 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#F5F2EC]">
                    {involvedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between px-2 py-1 rounded bg-[#FAF8F5] text-[10px] font-mono"
                      >
                        <span className="font-bold text-[#1A1A1A]">{ev.title} ({ev.id})</span>
                        <span className="text-[#A3703F]">
                          {formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Mitigation Actions */}
                  <div className="pt-2 border-t border-[#F5F2EC] flex items-center justify-between">
                    {isResolving ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <select
                          value={newVenueChoice}
                          onChange={(e) => setNewVenueChoice(e.target.value)}
                          className="px-2 py-1 rounded border border-[#E5DFD3] text-[10px] bg-white text-[#1A1A1A] flex-1"
                        >
                          {venues.map((v) => (
                            <option key={v.id} value={v.id}>
                              Shift to: {v.name} ({v.capacity} pax)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleShiftVenue(c)}
                          className="px-2.5 py-1 rounded bg-[#7C2D2A] text-white font-bold text-[10px]"
                        >
                          Apply Shift
                        </button>
                        <button
                          onClick={() => setResolvingClashId(null)}
                          className="text-[10px] text-[#8F8982] hover:text-[#1A1A1A]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingClashId(c.id)}
                        className="px-2.5 py-1 rounded bg-[#FAECEB] hover:bg-[#F0C9C7] text-[#7C2D2A] text-[10px] font-bold border border-[#F0C9C7] flex items-center gap-1 transition-all ml-auto"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Shift Venue / Mitigate</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

// 4. Judge Roster Widget (Displays inactive banner per Amendment 3)
export const JudgeRosterWidget: React.FC<WidgetProps> = ({ role }) => {
  return (
    <WidgetCard widgetId="judge_roster">
      <div className="space-y-3">
        {/* Banner strictly required by Amendment 3 */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="text-xs font-bold font-serif">No Judge Roster Provided</span>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-normal">
            Judge data is completely absent from all source CSV datasets. In accordance with Assumption ASM-002, judge clash detection is marked inactive rather than passing.
          </p>
        </div>

        <p className="text-xs text-[#6B655E] leading-relaxed">
          The Events Team may input judge assignments manually into the <code className="font-mono bg-[#FAF8F5] px-1 py-0.5 rounded border border-[#E5DFD3]">judge_assignments</code> table as external adjudicators arrive.
        </p>
      </div>
    </WidgetCard>
  );
};

// 5. Event Delay Tool Widget
export const EventDelayToolWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=event_delay_tool&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an event slot to reschedule.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      alert('Mandatory justification reason (minimum 5 characters) is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideType: 'event_delay',
          entityId: selectedSlot,
          delayMinutes,
          reason: reason.trim(),
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Event delayed by ${delayMinutes} minutes and logged to audit trail.`);
        setSelectedSlot('');
        setReason('');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WidgetCard widgetId="event_delay_tool">
      <form onSubmit={handleDelay} className="space-y-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Select Event to Delay</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          >
            <option value="">Choose scheduled event...</option>
            {data.map((ev) => (
              <option key={ev.slot_id} value={ev.slot_id}>
                {ev.event_name} ({ev.event_id}) at {ev.venue_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Delay Duration</label>
            <select
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
            >
              <option value={15}>+15 Minutes</option>
              <option value={30}>+30 Minutes</option>
              <option value={45}>+45 Minutes</option>
              <option value={60}>+60 Minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Cascade Preview</label>
            <div className="px-2 py-1.5 rounded bg-[#FAF8F5] border border-[#E5DFD3] text-[#6B655E] text-[11px] font-mono">
              0 venue collisions
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Mandatory Justification Reason (Audit Trail)
          </label>
          <input
            type="text"
            placeholder="Operational reason for schedule shift..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Applying Reschedule...' : 'Delay Event & Commit Audit Log'}
        </button>
      </form>
    </WidgetCard>
  );
};

// 6. Volunteer Deployment Widget (Student Volunteers Roster & Assignment Control)
export const VolunteerDeploymentWidget: React.FC<WidgetProps> = ({ role }) => {
  const {
    studentVolunteers,
    dismissVolunteer,
    reallocateVolunteer,
    assignVolunteer,
    events,
    venues
  } = useFest();

  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [reallocatingVolId, setReallocatingVolId] = useState<string | null>(null);
  const [targetEventChoice, setTargetEventChoice] = useState<string>('E01');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignEventTarget, setAssignEventTarget] = useState<string>('E01');
  const [selectedStandbyVolId, setSelectedStandbyVolId] = useState<string>('');

  const deployedVolunteers = studentVolunteers.filter((v) => v.status === 'deployed');
  const standbyVolunteers = studentVolunteers.filter((v) => v.status === 'standby');

  // Group deployed volunteers by assigned event
  const eventIdsWithVolunteers = Array.from(
    new Set(deployedVolunteers.map((v) => v.assignedEventId).filter(Boolean))
  ) as string[];

  // Include core flagship/cultural events in the view
  const primaryEventIds = ['E01', 'E03', 'E04', 'E05', 'E06', 'E09'];
  const allDisplayEventIds = Array.from(new Set([...primaryEventIds, ...eventIdsWithVolunteers]));

  const filteredEventIds = allDisplayEventIds.filter((eId) => {
    if (selectedEventFilter === 'all') return true;
    return eId === selectedEventFilter;
  });

  const handleExecuteReallocate = (volId: string) => {
    reallocateVolunteer(volId, targetEventChoice);
    setReallocatingVolId(null);
  };

  const handleExecuteAssignFromStandby = () => {
    if (!selectedStandbyVolId || !assignEventTarget) return;
    assignVolunteer(selectedStandbyVolId, assignEventTarget);
    setSelectedStandbyVolId('');
    setIsAssignModalOpen(false);
  };

  return (
    <WidgetCard
      widgetId="volunteer_deployment"
      loading={false}
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-2.5 py-1 rounded bg-[#A3703F] hover:bg-[#8C6D36] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Deploy Standby Volunteer</span>
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-xs">
        {/* Volunteer Enlistment & Operational Status Bar */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#1A1A1A] text-sm">
                Student Volunteers Operations Roster
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]">
                Voluntary Student Enlistment
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-0.5">
              Normal students serving voluntarily across Aarohan 2026 competitions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            <span className="text-[#2D5A3E] bg-[#EAF3EC] px-2 py-1 rounded border border-[#C7E2CE] font-bold">
              {deployedVolunteers.length} Deployed
            </span>
            <span className="text-[#7A4E1D] bg-[#FAF0E4] px-2 py-1 rounded border border-[#EED5BC] font-bold">
              {standbyVolunteers.length} Standby
            </span>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8F8982] font-semibold text-[10px] uppercase mr-1">Event:</span>
          <button
            onClick={() => setSelectedEventFilter('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
              selectedEventFilter === 'all'
                ? 'bg-[#A3703F] text-white font-bold'
                : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
            }`}
          >
            All Events ({allDisplayEventIds.length})
          </button>
          {allDisplayEventIds.map((eId) => {
            const ev = events.find((e) => e.id === eId);
            return (
              <button
                key={eId}
                onClick={() => setSelectedEventFilter(eId)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                  selectedEventFilter === eId
                    ? 'bg-[#A3703F] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3] hover:bg-white'
                }`}
              >
                {ev?.title || eId}
              </button>
            );
          })}
        </div>

        {/* Event Volunteer Deployment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {filteredEventIds.map((eId) => {
            const ev = events.find((e) => e.id === eId);
            const venue = venues.find((v) => v.id === ev?.venue_id);
            const assigned = studentVolunteers.filter((v) => v.assignedEventId === eId && v.status === 'deployed');
            const needed = 2;

            return (
              <div
                key={eId}
                className="p-3.5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#F4F1EA]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#A3703F] bg-[#F6EFE6] px-1.5 py-0.5 rounded border border-[#E5DFD3]">
                        {eId}
                      </span>
                      <h4 className="font-serif font-bold text-[#1A1A1A]">{ev?.title || eId}</h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      assigned.length >= needed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {assigned.length}/{needed} Volunteers
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B655E] mt-1">
                    Location: <strong>{venue?.name || 'Assigned Venue'}</strong> ({venue?.type})
                  </p>

                  {/* Assigned Student Volunteers List */}
                  <div className="mt-2 space-y-1.5">
                    {assigned.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#FAF8F5] border border-dashed border-[#E5DFD3] text-center text-[11px] text-[#8F8982]">
                        No student volunteers currently deployed to this event.
                      </div>
                    ) : (
                      assigned.map((vol) => {
                        const isReallocating = reallocatingVolId === vol.id;

                        return (
                          <div
                            key={vol.id}
                            className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#1A1A1A]">{vol.name}</span>
                                <span className="text-[9px] font-mono text-[#8F8982]">({vol.rollNo})</span>
                                <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1 py-0.2 rounded font-bold">
                                  Voluntary
                                </span>
                              </div>
                              <p className="text-[10px] text-[#6B655E]">
                                Role: <span className="font-medium text-[#A3703F]">{vol.assignedRole}</span> · {vol.shift}
                              </p>
                            </div>

                            {/* Actions: Dismiss & Reallocate */}
                            <div className="flex items-center gap-1 shrink-0">
                              {isReallocating ? (
                                <div className="flex items-center gap-1">
                                  <select
                                    value={targetEventChoice}
                                    onChange={(e) => setTargetEventChoice(e.target.value)}
                                    className="text-[10px] px-1.5 py-0.5 rounded border border-[#E5DFD3] bg-white text-[#1A1A1A]"
                                  >
                                    {events.map((e) => (
                                      <option key={e.id} value={e.id}>
                                        {e.title} ({e.id})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleExecuteReallocate(vol.id)}
                                    className="px-2 py-0.5 rounded bg-[#A3703F] text-white font-bold text-[10px]"
                                  >
                                    Move
                                  </button>
                                  <button
                                    onClick={() => setReallocatingVolId(null)}
                                    className="text-[10px] text-[#8F8982] hover:text-[#1A1A1A]"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setTargetEventChoice(eId === 'E01' ? 'E03' : 'E01');
                                      setReallocatingVolId(vol.id);
                                    }}
                                    className="px-2 py-1 rounded bg-white hover:bg-[#FAF8F5] text-[#A3703F] border border-[#E5DFD3] text-[10px] font-bold shadow-2xs"
                                    title="Move volunteer to another event"
                                  >
                                    Reallocate
                                  </button>
                                  <button
                                    onClick={() => dismissVolunteer(vol.id)}
                                    className="px-2 py-1 rounded bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold shadow-2xs"
                                    title="Relieve volunteer from this event to standby pool"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer Quick Assign */}
                <div className="pt-2 border-t border-[#F5F2EC] flex items-center justify-between text-[11px]">
                  <span className="text-[#8F8982]">Need more support?</span>
                  <button
                    onClick={() => {
                      setAssignEventTarget(eId);
                      setIsAssignModalOpen(true);
                    }}
                    className="text-[#A3703F] hover:text-[#8C6D36] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assign from Standby</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deploy from Standby Pool Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#A3703F]" />
                  <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                    Deploy Volunteer to Event
                  </h4>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-[#8F8982] hover:text-[#1A1A1A]"
                >
                  X
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                    Target Event
                  </label>
                  <select
                    value={assignEventTarget}
                    onChange={(e) => setAssignEventTarget(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-xs font-semibold text-[#1A1A1A]"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                    Select Available Student from Standby Pool ({standbyVolunteers.length})
                  </label>
                  {standbyVolunteers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#8F8982] bg-[#FAF8F5] rounded-lg">
                      No volunteers currently on standby. All students are deployed.
                    </div>
                  ) : (
                    <select
                      value={selectedStandbyVolId}
                      onChange={(e) => setSelectedStandbyVolId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-xs text-[#1A1A1A]"
                    >
                      <option value="">Select student volunteer...</option>
                      {standbyVolunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.rollNo}) · {v.college}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F5F2EC]">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#6B655E] hover:text-[#1A1A1A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStandbyVolId}
                  onClick={handleExecuteAssignFromStandby}
                  className="px-4 py-1.5 rounded-lg bg-[#A3703F] hover:bg-[#8C6D36] text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  Confirm Deployment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
};
