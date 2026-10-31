'use client';

import { useFest } from '@/context/FestContext';
import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Clock,
  UserCheck,
  Search,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';
import { formatISTDateTime } from '@/lib/formatters';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Checkin Counter Widget
export const CheckinCounterWidget: React.FC<WidgetProps> = ({ role }) => {
  const { checkedInCount } = useFest();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=checkin_counter&role=${role}`);
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

  const telemetry = data?.telemetry || { total_canonical: 2416, checked_in_count: 0, checkin_percentage: 0 };
  const contingents = data?.contingents || [];
  const liveCheckedIn = typeof checkedInCount === 'number' && checkedInCount > 0 ? checkedInCount : telemetry.checked_in_count;
  const livePct = Math.min(100, Math.round((liveCheckedIn / 2416) * 100));
  const livePending = Math.max(0, 2416 - liveCheckedIn);

  return (
    <WidgetCard widgetId="checkin_counter" loading={loading} error={error}>
      <div className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
            <p className="text-[11px] font-bold uppercase text-[#8F8982]">Verified Canonical</p>
            <p className="text-2xl font-serif font-bold text-[#1A1A1A] mt-0.5">{telemetry.total_canonical}</p>
            <p className="text-[10px] text-[#6B655E] mt-1 font-mono">Cleared from 2,836 pool</p>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
            <p className="text-[11px] font-bold uppercase text-emerald-800">Checked-In Credentialed</p>
            <p className="text-2xl font-serif font-bold text-emerald-900 mt-0.5">{liveCheckedIn}</p>
            <p className="text-[10px] text-emerald-700 mt-1 font-mono">{livePct}% festival progress</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
            <p className="text-[11px] font-bold uppercase text-[#8F8982]">Expected Pending</p>
            <p className="text-2xl font-serif font-bold text-[#A3703F] mt-0.5">
              {livePending}
            </p>
            <p className="text-[10px] text-[#6B655E] mt-1 font-mono">38 participating colleges</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-[#6B655E] mb-1 font-mono">
            <span>Overall Credentialing Completion</span>
            <span>{livePct}%</span>
          </div>
          <div className="w-full bg-[#EFEBE3] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#A3703F] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, livePct))}%` }}
            />
          </div>
        </div>

        {/* Contingent Distribution Table */}
        <div>
          <p className="text-xs font-bold text-[#1A1A1A] mb-2 font-serif">Contingent Check-In Snapshot</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {contingents.slice(0, 8).map((c: any) => (
              <div key={c.contingent_id} className="p-2 rounded bg-white border border-[#E5DFD3] flex justify-between items-center">
                <span className="font-mono font-bold text-[#1A1A1A] truncate max-w-[80px]">{c.contingent_id}</span>
                <span className="text-[11px] font-mono text-[#6B655E]">{c.checked_in}/{c.total_delegates}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. Checkin Queue Widget
export const CheckinQueueWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const { toggleCheckIn } = useFest();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=checkin_queue&role=${role}&query=${encodeURIComponent(search)}`);
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
  }, [role, search]);

  const handleCheckIn = async (participantId: string) => {
    setActionLoading(participantId);
    try {
      // 1. Instantly trigger real-time toggle in FestContext & broadcast to all portals
      await toggleCheckIn(participantId);

      // 2. Optimistic UI update in current queue
      setData((prev) =>
        prev.map((item) =>
          item.participant_id === participantId
            ? { ...item, checkin_status: 'checked_in', checked_in_at: new Date().toISOString() }
            : item
        )
      );

      if (onRefreshTrigger) onRefreshTrigger();
    } catch (e: any) {
      console.warn('Check-in error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <WidgetCard
      widgetId="checkin_queue"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No participants match search criteria."
      headerAction={
        <div className="relative">
          <input
            type="text"
            placeholder="Search ID, name, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-2.5 py-1 pl-7 rounded-md border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
          />
          <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2 top-1.5" />
        </div>
      }
    >
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {data.slice(0, 10).map((p) => {
          const isCheckedIn = p.checkin_status === 'checked_in';
          return (
            <div
              key={p.participant_id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                isCheckedIn
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : p.is_duplicate
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-[#E5DFD3]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1A1A1A]">{p.participant_id}</span>
                  <span className="text-xs font-serif font-bold text-[#1A1A1A] truncate">{p.name}</span>
                  {p.is_duplicate && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      Dup Warning
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B655E] truncate mt-0.5">
                  {p.college} ({p.contingent_id}) | T-Shirt: {p.tshirt_size || 'N/A'}
                </p>
              </div>

              <div>
                {isCheckedIn ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                  </span>
                ) : (
                  <button
                    onClick={() => handleCheckIn(p.participant_id)}
                    disabled={actionLoading === p.participant_id}
                    className="px-3 py-1 text-xs font-medium bg-[#A3703F] text-white rounded hover:bg-[#8C6D36] disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {actionLoading === p.participant_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Check In'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// 3. Duplicate Resolution Widget
export const DuplicateResolutionWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=duplicate_resolution&role=${role}`);
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

  const handleResolve = async (cand: any, action: 'confirm_canonical' | 'keep_distinct') => {
    const reason = prompt(
      action === 'confirm_canonical'
        ? `Enter non-empty operational reason to confirm ${cand.primary_id} as canonical for duplicate ${cand.duplicate_id}:`
        : `Enter non-empty operational reason to mark ${cand.primary_id} and ${cand.duplicate_id} as distinct participants:`
    );
    if (!reason || reason.trim().length < 5) {
      alert('Action aborted: A non-empty reason (minimum 5 characters) is mandatory.');
      return;
    }

    setActionLoading(cand.id);
    try {
      const res = await fetch('/api/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: cand.id,
          primaryId: cand.primary_id,
          duplicateId: cand.duplicate_id,
          action,
          reason,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <WidgetCard
      widgetId="duplicate_resolution"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No pending duplicate candidates requiring resolution."
    >
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {data.slice(0, 5).map((dup) => (
          <div key={dup.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-amber-900">{dup.id}</span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                Confidence: {Math.round(dup.confidence * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded border border-[#E5DFD3]">
              <div>
                <p className="text-[10px] font-bold text-[#8F8982] uppercase">Primary ({dup.primary_id})</p>
                <p className="font-serif font-bold text-[#1A1A1A]">{dup.primary_name}</p>
                <p className="text-[11px] text-[#6B655E] truncate">{dup.primary_college}</p>
                <p className="text-[10px] font-mono text-[#8F8982] mt-0.5">{dup.primary_contact}</p>
              </div>
              <div className="border-l border-[#EFEBE3] pl-2">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Duplicate ({dup.duplicate_id})</p>
                <p className="font-serif font-bold text-[#1A1A1A]">{dup.duplicate_name}</p>
                <p className="text-[11px] text-[#6B655E] truncate">{dup.duplicate_college}</p>
                <p className="text-[10px] font-mono text-[#8F8982] mt-0.5">{dup.duplicate_contact}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleResolve(dup, 'keep_distinct')}
                disabled={actionLoading === dup.id}
                className="px-2.5 py-1 text-xs border border-[#E5DFD3] rounded bg-white hover:bg-[#FAF8F5] text-[#6B655E]"
              >
                Keep Distinct
              </button>
              <button
                onClick={() => handleResolve(dup, 'confirm_canonical')}
                disabled={actionLoading === dup.id}
                className="px-2.5 py-1 text-xs bg-[#A3703F] text-white rounded hover:bg-[#8C6D36]"
              >
                Confirm Canonical
              </button>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 4. Wristband Issuance Widget
export const WristbandIssuanceWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=wristband_issuance&role=${role}`);
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
    <WidgetCard
      widgetId="wristband_issuance"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No wristbands issued yet in this session."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((b) => (
          <div key={b.participant_id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1A1A1A]">{b.participant_id}</span>
                <span className="font-serif font-bold text-[#1A1A1A]">{b.name}</span>
              </div>
              <p className="text-[11px] text-[#6B655E] mt-0.5">{b.college} | {b.desk}</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-[#A3703F] bg-[#F6EFE6] px-2 py-0.5 rounded border border-[#E5DFD3]">
                {b.wristband_serial || 'WB-ACTIVE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Late Arrivals Widget
export const LateArrivalsWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=late_arrivals&role=${role}`);
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
    <WidgetCard
      widgetId="late_arrivals"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="Zero expected contingents overdue."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((l) => (
          <div key={l.participant_id} className="p-2.5 rounded-lg bg-red-50/40 border border-red-200 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-red-900">{l.participant_id}</span>
                <span className="font-serif font-bold text-[#1A1A1A]">{l.name}</span>
              </div>
              <p className="text-[11px] text-[#6B655E] mt-0.5">{l.college} ({l.contingent_id})</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-red-700 bg-white px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatISTDateTime(l.arrival_datetime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 6. Quick Actions Widget
export const QuickActionsWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const handleWalkIn = async () => {
    const name = prompt('Enter walk-in delegate full name:');
    if (!name) return;
    const college = prompt('Enter college name:');
    if (!college) return;
    const reason = prompt('Enter operational reason for walk-in registration approval:');
    if (!reason || reason.trim().length < 5) {
      alert('Walk-in registration aborted: A non-empty reason is mandatory.');
      return;
    }

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'walk_in_registration',
          entityTable: 'participants',
          entityId: 'WALK-IN',
          payload: { name, college },
          reason,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('Walk-in registration request submitted to Festival Director.');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <WidgetCard widgetId="quick_actions">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleWalkIn}
          className="p-3.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] hover:bg-[#F6EFE6] text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-[#A3703F]">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-bold font-serif">Register Emergency Walk-In</span>
          </div>
          <p className="text-[11px] text-[#6B655E] mt-1 leading-normal">
            Creates an approval request routed to Director with mandatory justification.
          </p>
        </button>

        <div className="p-3.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#1A1A1A]">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold font-serif">Security & Discrepancy Queue</span>
          </div>
          <p className="text-[11px] text-[#6B655E] mt-1">
            417 participants flagged with blank gender sent to confirmation queue.
          </p>
        </div>
      </div>
    </WidgetCard>
  );
};

