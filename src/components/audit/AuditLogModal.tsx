'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, X, Search, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { formatISTTimeWithSeconds } from '@/lib/formatters';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useFest();
  const [query, setQuery] = useState('');
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch shared database audit logs across all 48 members
  const fetchSharedLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const json = await res.json();
      if (json && json.success && Array.isArray(json.logs)) {
        setDbLogs(json.logs);
      }
    } catch (e) {
      // In-memory fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSharedLogs();
      const interval = setInterval(fetchSharedLogs, 2500);

      const handleAuditUpdated = () => {
        fetchSharedLogs();
      };
      window.addEventListener('festos_audit_updated', handleAuditUpdated);

      return () => {
        clearInterval(interval);
        window.removeEventListener('festos_audit_updated', handleAuditUpdated);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Unify context in-memory logs with persisted database logs
  const combinedLogs = [
    ...dbLogs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp || l.created_at || new Date().toISOString(),
      actor: l.actor || (l.actor_id ? `${l.actor_id} (${l.actor_role || 'staff'})` : 'System Core'),
      action_type: l.action || l.action_type || 'OVERRIDE',
      entity_id: l.entity_id || 'SYS',
      entity_type: l.entity_type || 'general',
      reason: l.reason || 'Operational action committed',
      previous_state: typeof l.before_state === 'string' ? l.before_state : (typeof l.previous_state === 'string' ? l.previous_state : JSON.stringify(l.before_state || 'Previous State')),
      new_state: typeof l.after_state === 'string' ? l.after_state : (typeof l.new_state === 'string' ? l.new_state : JSON.stringify(l.after_state || 'Updated State')),
      approved_by: l.approved_by || l.actor_id || 'Directorate',
    })),
    ...auditLogs,
  ];

  // Deduplicate by ID
  const seenIds = new Set();
  const uniqueLogs = combinedLogs.filter((l) => {
    if (seenIds.has(l.id)) return false;
    seenIds.add(l.id);
    return true;
  });

  const filtered = uniqueLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(query.toLowerCase()) ||
      log.action_type.toLowerCase().includes(query.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(query.toLowerCase())) ||
      (log.approved_by && log.approved_by.toLowerCase().includes(query.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(query.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action Type', 'Entity ID', 'Entity Type', 'Reason', 'Previous State', 'New State', 'Approved By'];
    const rows = filtered.map((log) => [
      `"${log.timestamp}"`,
      `"${log.actor}"`,
      `"${log.action_type}"`,
      `"${log.entity_id}"`,
      `"${log.entity_type}"`,
      `"${(log.reason || '').replace(/"/g, '""')}"`,
      `"${log.previous_state || ''}"`,
      `"${log.new_state || ''}"`,
      `"${log.approved_by || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FestOS_Master_Audit_Trail.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl text-[#1A1A1A]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5DFD3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  FestOS Central Master Audit Trail
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]">
                  Live Shared Across All 48 Members
                </span>
              </div>
              <p className="text-xs text-[#6B655E]">
                Immutable centralized ledger. Every change published by any organizer reflects instantly across all screens.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSharedLogs}
              className="p-1.5 rounded-lg text-[#8F8982] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
              title="Refresh Audit Trail"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#A3703F]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8F8982] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Export Toolbar */}
        <div className="p-4 border-b border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF8F5]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8F8982] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by officer ID, department, action, or reason..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] placeholder:text-[#8F8982] focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8F8982] font-mono">
              {filtered.length} Recorded Action{filtered.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-bold border border-[#E5DFD3] shadow-sm flex items-center gap-2 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#A3703F]" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#8F8982] sticky top-0 border-b border-[#E5DFD3]">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Authorized Officer</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Mandatory Operational Reason</th>
                <th className="py-2.5 px-3">State Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEBE3] font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-2.5 px-3 text-[#8F8982] whitespace-nowrap" suppressHydrationWarning>
                    {formatISTTimeWithSeconds(log.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-bold text-[#1A1A1A]">
                    {log.actor}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#1A1A1A] font-bold">{log.entity_id}</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[#1A1A1A] max-w-sm">{log.reason}</td>
                  <td className="py-2.5 px-3 text-[10px]">
                    <span className="text-[#8F8982]">{log.previous_state}</span>
                    <span className="mx-1 text-[#8F8982]">&rarr;</span>
                    <span className="text-[#2D5A3E] font-bold">{log.new_state}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
