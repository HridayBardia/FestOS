'use client';

// Logistics Widgets Component Suite
// Complete 72-item inventory telemetry, venue deployment tracking, clash & alternative solver, and alert-connected damage reporter
// Zero em dashes or en dashes in any UI copy or metadata

import React, { useState, useEffect, useMemo } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Loader2,
  Search,
  Filter,
  Zap,
  Radio,
  Clock,
  Wrench,
  Check
} from 'lucide-react';
import { RoleKey } from '@/config/roles';
import { formatISTTime } from '@/lib/formatters';
import { useFest } from '@/context/FestContext';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Complete Inventory Status Widget (All 72 Items)
export const InventoryStatusWidget: React.FC<WidgetProps> = ({ role }) => {
  const { logistics } = useFest();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=inventory_status&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data);
      } else if (logistics && logistics.length > 0) {
        setData(logistics);
      }
    } catch (e: any) {
      if (logistics && logistics.length > 0) {
        setData(logistics);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, logistics]);

  const itemsToDisplay = data.length > 0 ? data : logistics;

  const filteredItems = useMemo(() => {
    let list = itemsToDisplay;

    if (conditionFilter !== 'all') {
      list = list.filter((i) => (i.condition || '').toLowerCase() === conditionFilter.toLowerCase());
    }

    if (locationFilter !== 'all') {
      list = list.filter((i) => i.location === locationFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.item_id || i.id || '').toLowerCase().includes(q) ||
          (i.item || i.item_name || '').toLowerCase().includes(q) ||
          (i.location || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [itemsToDisplay, conditionFilter, locationFilter, searchQuery]);

  return (
    <WidgetCard widgetId="inventory_status" loading={loading} error={error}>
      <div className="space-y-3">
        {/* KPI Counter & Search Filter Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F5F2EC] text-xs">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search 72 items (mic, speaker, L01-1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            />
            <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2 top-2" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-2 py-1 text-[11px] rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-semibold"
            >
              <option value="all">All Conditions ({itemsToDisplay.length})</option>
              <option value="good">Good (Ready)</option>
              <option value="needs check">Needs Check</option>
              <option value="under repair">Under Repair</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-2 py-1 text-[11px] rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-semibold"
            >
              <option value="all">All Depots</option>
              <option value="Store Room A">Store Room A</option>
              <option value="Main Stage">Main Stage</option>
              <option value="Van 1">Van 1</option>
              <option value="Registration Desk">Reg Desk</option>
              <option value="Sports Complex">Sports Complex</option>
            </select>
          </div>
        </div>

        {/* 72-Item Scrollable Telemetry Grid (Complete Database) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs max-h-[320px] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isRepair = item.condition === 'under repair' || item.condition === 'damaged';
            const isCheck = item.condition === 'needs check';
            const id = item.item_id || item.id;
            const name = item.item || item.item_name;
            const qty = item.quantity || item.total_quantity || 0;

            return (
              <div
                key={id}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isRepair
                    ? 'bg-[#FAECEB]/40 border-[#F0C9C7]'
                    : isCheck
                    ? 'bg-[#FAF0E4]/40 border-[#EED5BC]'
                    : 'bg-white border-[#E5DFD3]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-[#1A1A1A] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E5DFD3]">
                      {id}
                    </span>
                    <span className="font-bold text-[#A3703F]">Qty: {qty}</span>
                  </div>
                  <p className="font-serif font-bold text-[#1A1A1A] mt-1 capitalize text-xs">{name}</p>
                </div>

                <div className="mt-2 pt-1 border-t border-[#EFEBE3] text-[10px] font-mono flex items-center justify-between">
                  <span className="text-[#6B655E] truncate max-w-[90px]">{item.location}</span>
                  <span
                    className={`font-bold uppercase ${
                      isRepair
                        ? 'text-[#7C2D2A]'
                        : isCheck
                        ? 'text-[#7A4E1D]'
                        : 'text-emerald-700'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. Equipment by Venue Widget (With Clear Usage State)
export const EquipmentByVenueWidget: React.FC<WidgetProps> = ({ role }) => {
  const { events, venues } = useFest();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentTime = new Date('2026-10-31T07:18:40+05:30').getTime();
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v.name])), [venues]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=equipment_by_venue&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data);
      } else {
        // Fallback from context events
        const fallback = events
          .filter((e) => e.equipment_needs && e.equipment_needs !== 'no special equipment')
          .map((e) => ({
            event_id: e.id,
            event_name: e.title,
            venue_id: e.venue_id,
            venue_name: venueMap.get(e.venue_id) || e.venue_id,
            equipment_needs: e.equipment_needs,
            start_time: e.start_time,
            end_time: e.end_time
          }));
        setData(fallback);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, events]);

  return (
    <WidgetCard widgetId="equipment_by_venue" loading={loading} error={error}>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((eq, i) => {
          const start = new Date(eq.start_time).getTime();
          const end = new Date(eq.end_time).getTime();
          let statusBadge = { label: 'Scheduled', style: 'bg-blue-50 text-blue-800 border-blue-200' };

          if (currentTime >= end) {
            statusBadge = { label: 'Already Used / Completed', style: 'bg-gray-100 text-gray-700 border-gray-300' };
          } else if (currentTime >= start && currentTime < end) {
            statusBadge = { label: 'Live In Use', style: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' };
          }

          return (
            <div key={i} className="p-3 rounded-xl bg-white border border-[#E5DFD3] text-xs space-y-1.5 shadow-xs">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#A3703F] text-[10px]">{eq.event_id}</span>
                    <span className="font-serif font-bold text-[#1A1A1A] text-xs">{eq.event_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B655E] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#A3703F]" />
                    <span>{eq.venue_name}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusBadge.style}`}>
                  {statusBadge.label}
                </span>
              </div>

              <div className="pt-1.5 border-t border-[#F5F2EC] flex items-center justify-between text-[11px]">
                <span className="text-[#8F8982]">Required Gear:</span>
                <span className="font-mono font-bold text-[#7A4E1D] bg-[#FAF0E4] px-1.5 py-0.2 rounded border border-[#EED5BC]">
                  {eq.equipment_needs}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// 3. Shortages, Clashes and Alternatives Widget
export const ShortagesAndClashesWidget: React.FC<WidgetProps> = () => {
  const clashes = [
    {
      id: 'CLASH-01',
      title: 'Camera Fleet Outage (All 31 in Repair)',
      conflict: 'E07 (Nukkad Natak) and E10 (Design Sprint) need cameras, but lot L13-2 has 0 operational units.',
      alternative: 'Alternative: Authorize Media Cell mobile 4K smartphone gimbal backup rigs with HDMI capture.',
      severity: 'critical'
    },
    {
      id: 'CLASH-02',
      title: 'Speaker Scarcity at LT-1 & Quadrangle',
      conflict: 'E19 (IPL Auction) and E20 (Dance Face-off) demand speakers concurrently while 30 units are under repair.',
      alternative: 'Alternative: Sound-check and release Van 1 reserve lot L01-4 (16 speakers) + direct relay handover.',
      severity: 'high'
    },
    {
      id: 'CLASH-03',
      title: 'Barricade & Staging Overlap (14:30 - 15:15)',
      conflict: 'E05 (Battle of Bands) and E06 (Street Play) overlap, competing for mojo crowd barricades.',
      alternative: 'Alternative: Deploy Van 1 reserve lot L04-1 (20 barricades) to Quadrangle perimeter.',
      severity: 'medium'
    },
    {
      id: 'CLASH-04',
      title: 'Projector & Cord Overlap (10:30 - 12:00)',
      conflict: 'E13 (Poetry Slam) and E14 (Stand-up) overlap demanding projectors and 16A extension cords.',
      alternative: 'Alternative: Use Seminar Hall fixed ceiling AV; allocate mobile projector to Hostel Lawn.',
      severity: 'medium'
    }
  ];

  return (
    <WidgetCard widgetId="shortages_and_clashes" isEmpty={false}>
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
        {clashes.map((c) => (
          <div
            key={c.id}
            className={`p-3 rounded-xl border space-y-1.5 ${
              c.severity === 'critical'
                ? 'bg-[#FAECEB]/40 border-[#F0C9C7]'
                : c.severity === 'high'
                ? 'bg-[#FAF0E4]/40 border-[#EED5BC]'
                : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-[#1A1A1A]">{c.title}</span>
              <span
                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${
                  c.severity === 'critical'
                    ? 'bg-[#FAECEB] text-[#7C2D2A] border-[#F0C9C7]'
                    : 'bg-[#FAF0E4] text-[#7A4E1D] border-[#EED5BC]'
                }`}
              >
                {c.severity}
              </span>
            </div>

            <p className="text-[11px] text-[#6B655E]">{c.conflict}</p>

            <div className="pt-1.5 border-t border-[#F5F2EC] flex items-center gap-1.5 text-emerald-900 font-medium text-[11px]">
              <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{c.alternative}</span>
            </div>
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

  const handleDispatch = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'dispatched' } : item
      )
    );
  };

  return (
    <WidgetCard
      widgetId="move_request_queue"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No active gear movement requests in queue."
    >
      <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
        {data.map((req) => (
          <div
            key={req.id}
            className="p-3 rounded-lg bg-white border border-[#E5DFD3] text-xs shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#C4B9A5] transition-all"
          >
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1A1A1A]">{req.id}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FAF0E4] text-[#A3703F] border border-[#E5DFD3]">
                  {req.from_role ? `${req.from_role.toUpperCase()} TEAM` : 'EVENTS'}
                </span>
              </div>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  req.status === 'dispatched'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {req.status || 'PENDING'}
              </span>
            </div>

            <p className="font-serif font-bold text-[#1A1A1A] text-sm">
              {req.item || req.type || 'Stage & AV Equipment'}
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#6B655E] mt-2 pt-2 border-t border-[#EFEBE3]">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#A3703F]" />
                {req.venue_name || 'Auditorium (Main Hall)'}
              </span>
              {req.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => handleDispatch(req.id)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded bg-[#A3703F] text-white hover:bg-[#8C6D36] transition-colors shadow-sm"
                >
                  Mark Dispatched
                </button>
              ) : (
                <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Damage Report Form Widget (Connected Live to Alert Broadcast System)
export const DamageReportFormWidget: React.FC<WidgetProps> = () => {
  const { logistics, logEquipmentDamage } = useFest();
  const [selectedItemId, setSelectedItemId] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [condition, setCondition] = useState<'under repair' | 'needs check' | 'damaged'>('under repair');
  const [quantity, setQuantity] = useState(1);
  const [statusMsg, setStatusMsg] = useState('');

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      alert('Please select an equipment item lot from the database.');
      return;
    }
    if (!conditionNote || conditionNote.trim().length < 5) {
      alert('Mandatory damage explanation (minimum 5 characters) is required.');
      return;
    }

    const item = logistics.find((i) => i.id === selectedItemId || i.item_id === selectedItemId);
    const itemName = item ? item.item_name : selectedItemId;
    const location = item ? item.location : 'Central Depot';

    // Logs into damage history and broadcasts operational alert live across all 8 dashboards
    logEquipmentDamage({
      itemId: selectedItemId,
      itemName,
      quantityAffected: quantity,
      depotLocation: location,
      severity,
      reportedCondition: condition,
      defectDescription: conditionNote.trim(),
      loggedBy: 'Logistics Floor Desk',
      loggedRole: 'Logistics Lead'
    });

    setStatusMsg(`Damage logged for ${itemName}. Live alert broadcast to all dashboards!`);
    setSelectedItemId('');
    setConditionNote('');
    setQuantity(1);

    setTimeout(() => {
      setStatusMsg('');
    }, 5000);
  };

  return (
    <WidgetCard widgetId="damage_report_form">
      <form onSubmit={handleReport} className="space-y-2.5 text-xs">
        {statusMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Select Logistics Item Lot (72 Database Items) *
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            required
            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] text-xs font-mono"
          >
            <option value="">Select item...</option>
            {logistics.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} - {i.item_name} ({i.location}, Qty: {i.total_quantity || i.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full px-2 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-xs"
            >
              <option value="under repair">Under Repair</option>
              <option value="needs check">Needs Check</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Alert Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full px-2 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-xs"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Defect Assessment & Diagnosis *
          </label>
          <textarea
            placeholder="Describe physical fault, required repair, or replacement..."
            value={conditionNote}
            onChange={(e) => setConditionNote(e.target.value)}
            rows={2}
            required
            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] text-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-3 rounded-lg bg-[#A3703F] text-white font-bold hover:bg-[#8C6D36] transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Broadcast Incident Alert & Update Stock</span>
        </button>
      </form>
    </WidgetCard>
  );
};
