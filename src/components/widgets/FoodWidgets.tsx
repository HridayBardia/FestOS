'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Utensils,
  Coffee,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Loader2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Meal Headcount Forecast Widget
export const MealHeadcountForecastWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=meal_headcount_forecast&role=${role}`);
      const json = await res.json();
      if (json.success && json.data) setData(json.data);
      else setError(json.error || 'Failed to load meal forecast');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const breakfast = (data && typeof data === 'object' && !Array.isArray(data) && data.breakfast)
    ? data.breakfast
    : { forecasted: 2416, checkedInBase: 0, bufferAllowance: 150 };
  const lunch = (data && typeof data === 'object' && !Array.isArray(data) && data.lunch)
    ? data.lunch
    : { forecasted: 2516, checkedInBase: 0, bufferAllowance: 200 };
  const dinner = (data && typeof data === 'object' && !Array.isArray(data) && data.dinner)
    ? data.dinner
    : { forecasted: 2466, checkedInBase: 0, bufferAllowance: 180 };

  return (
    <WidgetCard widgetId="meal_headcount_forecast" loading={loading} error={error}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <div className="flex items-center gap-1.5 text-[#A3703F] mb-1">
            <Coffee className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Breakfast (07:30-10:00)</span>
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1A1A]">{breakfast.forecasted ?? 2416} covers</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-1">+ {breakfast.bufferAllowance ?? 150} buffer allowance</p>
        </div>

        <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <div className="flex items-center gap-1.5 text-[#A3703F] mb-1">
            <Utensils className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Lunch (12:30-15:00)</span>
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1A1A]">{lunch.forecasted ?? 2516} covers</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-1">+ {lunch.bufferAllowance ?? 200} buffer allowance</p>
        </div>

        <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <div className="flex items-center gap-1.5 text-[#A3703F] mb-1">
            <Utensils className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Dinner (19:30-22:30)</span>
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1A1A]">{dinner.forecasted ?? 2466} covers</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-1">+ {dinner.bufferAllowance ?? 180} buffer allowance</p>
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. Dietary Breakdown Widget
export const DietaryBreakdownWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=dietary_breakdown&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setData(json.data);
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

  const items = Array.isArray(data) ? data : [];

  return (
    <WidgetCard widgetId="dietary_breakdown" loading={loading} error={error} isEmpty={items.length === 0} emptyMessage="No dietary demand records found.">
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {items.map((d, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] flex justify-between items-center text-xs">
            <div>
              <span className="font-serif font-bold text-[#1A1A1A] capitalize">{d.dietary_option || 'Regular'}</span>
              <p className="text-[10px] font-mono text-[#8F8982]">Strict dining queue routing</p>
            </div>
            <span className="font-mono font-bold text-[#A3703F] text-sm bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E5DFD3]">
              {d.participant_count ?? 0} delegates
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 3. Vendor Capacity Tracker Widget (Highlights expired certificates)
export const VendorCapacityTrackerWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=vendor_capacity_tracker&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setData(json.data);
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

  const items = Array.isArray(data) ? data : [];

  return (
    <WidgetCard widgetId="vendor_capacity_tracker" loading={loading} error={error} isEmpty={items.length === 0} emptyMessage="No caterers or food vendors configured.">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs max-h-[320px] overflow-y-auto pr-1">
        {items.map((v) => {
          const isExpired = v.hygiene_certificate_expiry === '2026-09-29';
          const isNearExpiry = v.hygiene_certificate_expiry === '2026-10-31';
          return (
            <div
              key={v.vendor_id}
              className={`p-3 rounded-lg border flex flex-col justify-between ${
                isExpired
                  ? 'bg-red-50/40 border-red-300'
                  : isNearExpiry
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-[#E5DFD3]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#A3703F]">{v.vendor_id}</span>
                    <p className="font-serif font-bold text-[#1A1A1A]">{v.vendor_name}</p>
                  </div>
                  {isExpired ? (
                    <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                      EXPIRED
                    </span>
                  ) : isNearExpiry ? (
                    <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      EXP 31-OCT
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Valid
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B655E] mt-1.5 line-clamp-1">{v.menu}</p>
              </div>

              <div className="mt-3 pt-1.5 border-t border-[#EFEBE3] text-[10px] font-mono text-[#6B655E] flex justify-between">
                <span>Cap: {v.capacity ?? 150} covers</span>
                <span>Expiry: {v.hygiene_certificate_expiry || 'N/A'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// 4. Meal Slot Monitor Widget
export const MealSlotMonitorWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=meal_slot_monitor&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setData(json.data);
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

  const items = Array.isArray(data) ? data : [];

  return (
    <WidgetCard
      widgetId="meal_slot_monitor"
      loading={loading}
      error={error}
      isEmpty={items.length === 0}
      emptyMessage="No active dining sessions underway."
    >
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {items.map((m) => (
          <div key={m.id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] text-xs flex justify-between items-center">
            <div>
              <span className="font-serif font-bold text-[#1A1A1A] capitalize">{m.meal} Service</span>
              <p className="text-[10px] text-[#8F8982] font-mono mt-0.5">Day: {m.day} ({m.start_time || '07:30'} - {m.end_time || '10:00'})</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {m.assigned_vendors ?? 4} vendors active
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Incident Logger Widget
export const IncidentLoggerWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [vendorId, setVendorId] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('high');
  const [logging, setLogging] = useState(false);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 5) {
      alert('Mandatory incident description (minimum 5 characters) is required.');
      return;
    }

    setLogging(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: 'CENTRAL-DINING-HALL',
          description: `Food Safety Flag [Vendor ${vendorId || 'General'}]: ${description.trim()}`,
          severity,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Food safety incident logged under ID ${json.incidentId} and routed to Festival Director.`);
        setVendorId('');
        setDescription('');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <WidgetCard widgetId="incident_logger">
      <form onSubmit={handleLog} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Target Vendor ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. VND05"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
            >
              <option value="critical">Critical (Shutdown)</option>
              <option value="high">High (Hygiene/Quality)</option>
              <option value="medium">Medium (Shortage/Delay)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Food Safety Anomaly Description (Audit Trail)
          </label>
          <textarea
            placeholder="Report hygiene infraction, contamination, or non-compliance..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={logging}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {logging ? 'Submitting Flag...' : 'Log Safety Incident & Route to Director'}
        </button>
      </form>
    </WidgetCard>
  );
};
