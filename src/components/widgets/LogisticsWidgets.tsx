'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Loader2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Inventory Status Widget
export const InventoryStatusWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=inventory_status&role=${role}`);
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
    <WidgetCard widgetId="inventory_status" loading={loading} error={error}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs max-h-[300px] overflow-y-auto pr-1">
        {data.slice(0, 16).map((item) => (
          <div key={item.item_id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[10px] text-[#8F8982] font-mono">
                <span>{item.item_id}</span>
                <span className="font-bold text-[#A3703F]">Qty: {item.quantity}</span>
              </div>
              <p className="font-serif font-bold text-[#1A1A1A] mt-1">{item.item}</p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#EFEBE3] text-[10px] font-mono text-[#6B655E] flex justify-between">
              <span>{item.location || 'Warehouse'}</span>
              <span className="text-emerald-700 font-bold">{item.condition || 'Good'}</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 2. Equipment by Venue Widget
export const EquipmentByVenueWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=equipment_by_venue&role=${role}`);
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
    <WidgetCard widgetId="equipment_by_venue" loading={loading} error={error}>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {data.map((eq, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-[#1A1A1A]">{eq.event_name}</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5DFD3] text-[#A3703F]">
                {eq.venue_name}
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-1">
              Required: {eq.equipment_needs}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 3. Shortages and Clashes Widget
export const ShortagesAndClashesWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=shortages_and_clashes&role=${role}`);
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
      widgetId="shortages_and_clashes"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No critical equipment stock shortages detected."
    >
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {data.map((sh) => (
          <div key={sh.item_id} className="p-2.5 rounded-lg bg-amber-50/40 border border-amber-200 text-xs flex justify-between items-center">
            <div>
              <span className="font-serif font-bold text-amber-900">{sh.item}</span>
              <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">Location: {sh.location}</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
              Only {sh.quantity} units left
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 4. Move Request Queue Widget
export const MoveRequestQueueWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=move_request_queue&role=${role}`);
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
      widgetId="move_request_queue"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No active gear movement requests in queue."
    >
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {data.map((req) => (
          <div key={req.id} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-[#1A1A1A]">{req.id}</span>
              <span className="text-[10px] uppercase font-bold text-[#A3703F]">{req.status}</span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-1">From: {req.from_role} | Type: {req.type}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Damage Report Form Widget
export const DamageReportFormWidget: React.FC<WidgetProps> = ({ role }) => {
  const [itemId, setItemId] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) {
      alert('Please enter logistics Item ID.');
      return;
    }
    if (!conditionNote || conditionNote.trim().length < 5) {
      alert('Mandatory damage explanation (minimum 5 characters) is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: 'LOGISTICS-DEPOT',
          description: `Damage reported on Item ${itemId}: ${conditionNote.trim()}`,
          severity: 'medium',
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Damage incident recorded under ID ${json.incidentId}. Operational stock updated.`);
        setItemId('');
        setConditionNote('');
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
    <WidgetCard widgetId="damage_report_form">
      <form onSubmit={handleReport} className="space-y-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Logistics Item ID</label>
          <input
            type="text"
            placeholder="e.g. ITM01"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Defect / Damage Assessment (Audit Trail)
          </label>
          <textarea
            placeholder="Describe physical fault, required repair, or replacement..."
            value={conditionNote}
            onChange={(e) => setConditionNote(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Logging Incident...' : 'Flag Damaged Stock & Log Audit'}
        </button>
      </form>
    </WidgetCard>
  );
};

