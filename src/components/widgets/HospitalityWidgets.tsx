'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Hotel,
  Building,
  AlertCircle,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Bed Occupancy Matrix Widget
export const BedOccupancyMatrixWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=bed_occupancy_matrix&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  const rooms = data?.rooms || [];
  const summary = data?.summary || { total_campus_beds: 710, total_occupied: 710 };

  return (
    <WidgetCard widgetId="bed_occupancy_matrix" loading={loading} error={error}>
      <div className="space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
            <p className="text-[10px] font-bold uppercase text-[#8F8982]">Total Campus Beds</p>
            <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-0.5">{summary.total_campus_beds || 710}</p>
            <p className="text-[10px] font-mono text-[#6B655E]">200 hostel rooms on campus</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200">
            <p className="text-[10px] font-bold uppercase text-emerald-800">Occupied / Allocated Beds</p>
            <p className="text-xl font-serif font-bold text-emerald-900 mt-0.5">{summary.total_occupied || 710}</p>
            <p className="text-[10px] font-mono text-emerald-700">100% capacity deployed</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
            <p className="text-[10px] font-bold uppercase text-[#8F8982]">Available Vacant</p>
            <p className="text-xl font-serif font-bold text-[#A3703F] mt-0.5">
              {Math.max(0, (summary.total_campus_beds || 710) - (summary.total_occupied || 710))}
            </p>
            <p className="text-[10px] font-mono text-[#6B655E]">Zero unreserved buffer</p>
          </div>
        </div>

        {/* Room Grid Sample */}
        <div>
          <p className="text-xs font-bold font-serif text-[#1A1A1A] mb-2">Hostel Rooms Grid (Sample)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs max-h-[220px] overflow-y-auto pr-1">
            {rooms.slice(0, 24).map((r: any) => {
              const isFull = r.available_beds <= 0;
              return (
                <div
                  key={r.room_id}
                  className={`p-2 rounded border text-center ${
                    isFull ? 'bg-[#FAF8F5] border-[#E5DFD3]' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <p className="font-mono font-bold text-[11px] text-[#1A1A1A]">{r.room_id}</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#8F8982]">
                    {r.block} | Fl {r.floor}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5 font-medium text-[#6B655E]">
                    {r.occupied_beds}/{r.capacity} beds
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. External Stay Tracker Widget
export const ExternalStayTrackerWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=external_stay_tracker&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard
      widgetId="external_stay_tracker"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No external stay properties configured."
    >
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {data.map((es) => (
          <div key={es.property_id} className="p-3 rounded-lg bg-white border border-[#E5DFD3] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-[#A3703F] mr-2">{es.property_id}</span>
                <span className="font-serif font-bold text-[#1A1A1A]">{es.property_name}</span>
              </div>
              <span className="font-mono text-[11px] text-[#6B655E]">
                {es.allocated_beds}/{es.total_beds} beds
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B655E] pt-1 border-t border-[#EFEBE3]">
              <span>Rs. {Number(es.cost_per_bed_per_night).toLocaleString('en-IN')}/bed/night</span>
              <span>{es.distance_km} km ({es.transport_availability || 'Shuttle'})</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 3. Contingent Rooming Widget
export const ContingentRoomingWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=contingent_rooming&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard
      widgetId="contingent_rooming"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No contingent rooming allocations recorded."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((c) => (
          <div key={c.contingent_id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-[#1A1A1A] truncate max-w-[180px]">{c.college}</span>
              <span className="font-mono text-[#A3703F] text-[11px]">{c.beds_allocated}/{c.total_delegates} housed</span>
            </div>
            <p className="text-[10px] text-[#8F8982] mt-1 font-mono truncate">
              Blocks: {c.hostel_blocks || 'Campus & Overflow'}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 4. Checkin Pipeline Widget
export const CheckinPipelineWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=checkin_pipeline&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard
      widgetId="checkin_pipeline"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="Zero incoming contingents in next pipeline window."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((pipe) => (
          <div key={pipe.contingent_id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] text-xs flex justify-between items-center">
            <div>
              <span className="font-serif font-bold text-[#1A1A1A]">{pipe.college}</span>
              <p className="text-[10px] text-[#8F8982] font-mono mt-0.5">
                Arrival: {pipe.first_arrival} | Declared: {pipe.strength_declared} pax
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Special Needs Queue Widget
export const SpecialNeedsQueueWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=special_needs_queue&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard
      widgetId="special_needs_queue"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No accessibility or special accommodation flags."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((sn) => (
          <div key={sn.participant_id} className="p-2.5 rounded-lg bg-amber-50/30 border border-amber-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-[#1A1A1A]">{sn.name}</span>
              <span className="font-mono text-[10px] text-amber-900 font-bold">
                Room: {sn.room_id || 'External Stay'} (Fl {sn.floor !== null ? sn.floor : 'Ground'})
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-0.5">{sn.college}</p>
            <div className="mt-1 flex gap-2 text-[10px] font-mono">
              {sn.accessibility_needs && sn.accessibility_needs !== 'none' && (
                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                  Need: {sn.accessibility_needs}
                </span>
              )}
              {sn.dietary_needs && (
                <span className="bg-[#FAF8F5] border border-[#E5DFD3] text-[#6B655E] px-1.5 py-0.2 rounded">
                  Diet: {sn.dietary_needs}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 6. Room Override Form Widget
export const RoomOverrideFormWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [participantId, setParticipantId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId || !roomId) {
      alert('Participant ID and Target Room ID are required.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      alert('Mandatory constraint violation: A non-empty operational reason (minimum 5 characters) is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideType: 'room_reallocation',
          entityId: participantId.trim(),
          newTargetId: roomId.trim(),
          reason: reason.trim(),
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Room override committed to audit log. Participant ${participantId} assigned to Room ${roomId}.`);
        setParticipantId('');
        setRoomId('');
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
    <WidgetCard widgetId="room_override_form">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Participant ID</label>
            <input
              type="text"
              placeholder="e.g. P0001"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Target Room ID</label>
            <input
              type="text"
              placeholder="e.g. G01"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Mandatory Justification Reason (Audit Trail)
          </label>
          <textarea
            placeholder="Operational reason for room transfer or constraint override..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Committing Override...' : 'Authorize Room Transfer & Log Audit'}
        </button>
      </form>
    </WidgetCard>
  );
};

// 7. Approval Requests Widget
export const ApprovalRequestsWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=approval_requests&role=${role}`);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard
      widgetId="approval_requests"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No pending approval requests sent to director."
    >
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {data.map((app) => (
          <div key={app.id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-[#1A1A1A]">{app.id}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  app.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : app.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {app.status}
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-1 line-clamp-2">{app.reason}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

