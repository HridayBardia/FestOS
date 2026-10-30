'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Shirt,
  ShoppingBag,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
  Loader2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Stock by Size Widget
export const StockBySizeWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=stock_by_size&role=${role}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setData(json.data);
      else setError(json.error || 'Failed to load stock data');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  // Separate apparel (sizes S, M, L, XL, XXL) from collateral items (ID cards, lanyards, medals, badges)
  const apparel = data.filter((m) => m.is_apparel || (m.size && m.size !== 'NA'));
  const collateral = data.filter((m) => !m.is_apparel || m.size === 'NA');

  return (
    <WidgetCard widgetId="stock_by_size" loading={loading} error={error}>
      <div className="space-y-4 text-xs">
        {/* Apparel Section: S, M, L, XL, XXL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Festival T-Shirts by Size</span>
            <span className="text-[10px] font-mono text-[#A3703F]">Aarohan 2026 Official Apparel</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {apparel.map((m) => {
              const available = m.available_balance ?? (m.total_stock - (m.issued_count || 0) - (m.reserved_quantity || 0));
              return (
                <div key={m.id || m.size} className="p-3 rounded-lg bg-white border border-[#E5DFD3] text-center shadow-xs">
                  <span className="font-mono text-base font-bold text-[#A3703F]">{m.size}</span>
                  <p className="font-serif font-bold text-[#1A1A1A] text-lg mt-0.5">{available} left</p>
                  <div className="mt-2 pt-1 border-t border-[#EFEBE3] text-[10px] font-mono text-[#6B655E] flex flex-col gap-0.5">
                    <span>Total: {m.total_stock}</span>
                    <span>Issued: {m.issued_count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kit Collateral Section */}
        {collateral.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8982]">Kit Collateral & Accreditation Depot</span>
              <span className="text-[10px] font-mono text-[#6B655E]">Physical Credentials</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {collateral.map((m) => {
                const available = m.available_balance ?? (m.total_stock - (m.issued_count || 0) - (m.reserved_quantity || 0));
                return (
                  <div key={m.id || m.item} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] text-center shadow-xs flex flex-col justify-between">
                    <span className="font-sans text-[11px] font-bold text-[#1A1A1A] line-clamp-1" title={m.item}>
                      {m.item}
                    </span>
                    <p className="font-serif font-bold text-[#A3703F] text-base mt-1">{available} left</p>
                    <div className="mt-2 pt-1 border-t border-[#EFEBE3] text-[10px] font-mono text-[#6B655E] flex flex-col gap-0.5">
                      <span>Total: {m.total_stock}</span>
                      <span>Issued: {m.issued_count || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
};

// 2. Issuance Station Widget
export const IssuanceStationWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [participantId, setParticipantId] = useState('');
  const [size, setSize] = useState('L');
  const [issuing, setIssuing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=issuance_station&role=${role}`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [role]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) {
      alert('Participant ID is required.');
      return;
    }

    setIssuing(true);
    try {
      const res = await fetch('/api/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'issue',
          participantId: participantId.trim(),
          itemType: 'Festival Kit & Hoodie',
          size,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Merchandise kit (Size: ${size}) successfully issued to ${participantId}.`);
        setParticipantId('');
        await fetchHistory();
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <WidgetCard widgetId="issuance_station">
      <div className="space-y-4 text-xs">
        <form onSubmit={handleIssue} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Participant ID</label>
              <input
                type="text"
                placeholder="e.g. P0001"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-white text-[#1A1A1A] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Kit Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-white text-[#1A1A1A] font-mono"
              >
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="XXL">Double XL (XXL)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={issuing}
            className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
          >
            {issuing ? 'Verifying & Issuing...' : 'Verify Eligibility & Issue Kit'}
          </button>
        </form>

        <div>
          <p className="text-[11px] font-bold uppercase text-[#8F8982] mb-1.5">Recent Issuances Station Log</p>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="p-2 rounded bg-white border border-[#E5DFD3] flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A]">{h.participant_id}</span>
                  <span className="text-[#6B655E] ml-2">({h.size})</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700">Issued</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// 3. Duplicate Claim Detector Widget
export const DuplicateClaimDetectorWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=duplicate_claim_detector&role=${role}`);
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
      widgetId="duplicate_claim_detector"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="Zero double-claim attempts detected by uniqueness constraint."
    >
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {data.map((c, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-red-50/40 border border-red-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-red-900">{c.canonical_id}</span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-red-200 text-red-700">
                {c.claim_attempts} claim attempts
              </span>
            </div>
            <p className="text-[11px] text-[#6B655E] mt-1">Associated aliases: {c.associated_ids}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 4. Size Exchange Tool Widget
export const SizeExchangeToolWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [participantId, setParticipantId] = useState('');
  const [newSize, setNewSize] = useState('XL');
  const [reason, setReason] = useState('');
  const [exchanging, setExchanging] = useState(false);

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) {
      alert('Participant ID is required.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      alert('Mandatory size exchange justification reason is required.');
      return;
    }

    setExchanging(true);
    try {
      const res = await fetch('/api/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'exchange',
          participantId: participantId.trim(),
          itemType: 'Festival Kit & Hoodie',
          size: newSize,
          exchangeReason: reason.trim(),
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Size exchange processed. Old size ${json.oldSize} restocked; size ${json.newSize} issued.`);
        setParticipantId('');
        setReason('');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExchanging(false);
    }
  };

  return (
    <WidgetCard widgetId="size_exchange_tool">
      <form onSubmit={handleExchange} className="space-y-3 text-xs">
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
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Requested New Size</label>
            <select
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Exchange Reason (Audit Trail)</label>
          <input
            type="text"
            placeholder="Operational justification for size swap..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={exchanging}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {exchanging ? 'Swapping Stock...' : 'Process Size Swap & Update Stock'}
        </button>
      </form>
    </WidgetCard>
  );
};

// 5. Contingent Bulk Pickup Widget
export const ContingentBulkPickupWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=contingent_bulk_pickup&role=${role}`);
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

  const handleBulkIssue = async (contingent: any) => {
    setIssuingId(contingent.contingent_id);
    try {
      const res = await fetch('/api/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'bulk_issue',
          contingentId: contingent.contingent_id,
          college: contingent.college,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) =>
          prev.map((c) =>
            c.contingent_id === contingent.contingent_id
              ? { ...c, kits_issued: c.total_delegates }
              : c
          )
        );
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error || 'Failed to issue bulk batch');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <WidgetCard widgetId="contingent_bulk_pickup" loading={loading} error={error}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs max-h-[320px] overflow-y-auto pr-1">
        {data.map((c) => {
          const total = c.total_delegates || 1;
          const issued = c.kits_issued ?? Math.floor(total * 0.7);
          const isComplete = issued >= total;
          const isPending = !isComplete;
          const isProcessing = issuingId === c.contingent_id;

          return (
            <div key={c.contingent_id} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-[#A3703F]">{c.contingent_id}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                    isComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isComplete ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <p className="font-serif font-bold text-[#1A1A1A] text-sm truncate" title={c.college}>
                  {c.college}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#EFEBE3] space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-[#6B655E]">
                  <span>Issued: <strong className="text-[#1A1A1A]">{issued}</strong>/{total}</span>
                  <span>{Math.round((issued / total) * 100)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#EFEBE3] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-600' : 'bg-[#A3703F]'}`}
                    style={{ width: `${Math.min(100, Math.round((issued / total) * 100))}%` }}
                  />
                </div>

                {isPending && (
                  <button
                    onClick={() => handleBulkIssue(c)}
                    disabled={isProcessing}
                    className="w-full mt-1 py-1 px-2 text-[10px] font-bold uppercase rounded bg-[#A3703F] text-white hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Issuing...' : 'Issue Batch'}
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
