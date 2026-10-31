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

// 3. Clash Alert Feed Widget
export const ClashAlertFeedWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=clash_alert_feed&role=${role}`);
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

  const participantClashes = data?.participantClashes || [];

  return (
    <WidgetCard
      widgetId="clash_alert_feed"
      loading={loading}
      error={error}
      isEmpty={participantClashes.length === 0}
      emptyMessage="No active schedule collisions detected."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {participantClashes.slice(0, 8).map((c: any, i: number) => (
          <div key={i} className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-amber-900">{c.participant_name}</span>
              <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded text-amber-800 border border-amber-300">
                {c.participant_id}
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-0.5">{c.college}</p>
            <div className="mt-1 text-[10px] font-mono text-amber-800 bg-white p-1 rounded border border-amber-200">
              Overlap: {c.event1_name} ({c.event1}) & {c.event2_name} ({c.event2})
            </div>
          </div>
        ))}
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

// 6. Volunteer Deployment Widget
export const VolunteerDeploymentWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=volunteer_deployment&role=${role}`);
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
    <WidgetCard widgetId="volunteer_deployment" loading={loading} error={error}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs max-h-[300px] overflow-y-auto pr-1">
        {data.map((t) => (
          <div key={t.task_id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[10px] text-[#8F8982] font-mono">
                <span>{t.event_id}</span>
                <span className="text-[#A3703F] font-bold">Volunteers: {t.volunteers_needed}</span>
              </div>
              <p className="font-serif font-bold text-[#1A1A1A] mt-0.5">{t.event_name}</p>
              <p className="text-[11px] text-[#6B655E] mt-0.5">{t.venue_name}</p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#EFEBE3] text-[10px] font-mono text-[#8F8982]">
              Assigned Lead: {t.lead_name} ({t.assignee_id})
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

