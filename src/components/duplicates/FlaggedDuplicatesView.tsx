'use client';

// FestOS Flagged Intake & Duplicate Candidates Audit View
// Allows the registration officer to recheck, verify, and understand why 420 participants were flagged
// Zero em dashes or en dashes in any UI copy or code

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Filter,
  RefreshCw,
  UserCheck,
  Building2,
  Phone,
  HelpCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFest } from '@/context/FestContext';

interface Candidate {
  id: string;
  primary_id: string;
  duplicate_id: string;
  match_criteria: string;
  confidence: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolution_note?: string;
  resolved_by?: string;
  created_at?: string;
  primary_name: string;
  primary_college: string;
  primary_contact: string;
  primary_tshirt?: string;
  duplicate_name: string;
  duplicate_college: string;
  duplicate_contact: string;
  duplicate_tshirt?: string;
}

interface Summary {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
}

export const FlaggedDuplicatesView: React.FC = () => {
  const { contingents } = useFest();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 420, pending: 420, resolved: 0, dismissed: 0 });
  const [totalCount, setTotalCount] = useState<number>(420);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{
    candidate: Candidate;
    action: 'confirm_canonical' | 'keep_distinct';
  } | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        status: statusFilter,
        search: search.trim(),
        college: collegeFilter,
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`/api/duplicates?${q.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCandidates(json.candidates || []);
        if (json.summary) setSummary(json.summary);
        setTotalCount(json.totalCount || 0);
      } else {
        setError(json.error || 'Failed to fetch flagged candidates');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching duplicate records');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, collegeFilter, page, pageSize]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleExecuteResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const trimmed = actionReason.trim();
    if (trimmed.length < 5) {
      alert('A non-empty resolution reason (minimum 5 characters) is required for the audit log.');
      return;
    }

    const { candidate, action } = activeModal;
    setActionLoading(candidate.id);
    try {
      const res = await fetch('/api/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          primaryId: candidate.primary_id,
          duplicateId: candidate.duplicate_id,
          action,
          reason: trimmed,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActiveModal(null);
        setActionReason('');
        await fetchCandidates();
      } else {
        alert(json.error || 'Failed to process resolution');
      }
    } catch (err: any) {
      alert(err.message || 'Network error during resolution');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* Header and Editorial Context */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-200">
              Registration Quality Control
            </span>
            <span className="text-xs text-[#8F8982]">Audit & Anomaly Resolution</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Flagged Intake & Duplicate Candidates Audit
          </h2>
          <p className="text-xs text-[#6B655E] mt-1 max-w-2xl leading-relaxed">
            Out of 2,836 total intake submissions, 420 candidates were flagged because multiple records matched on student name and participating institute. Inspect why each entry was flagged, identify distinct delegates with shared names, or merge confirmed duplicate submissions.
          </p>
        </div>

        <button
          onClick={() => fetchCandidates()}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E5DFD3] text-xs font-semibold text-[#1A1A1A] flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD3] shadow-card">
          <p className="text-[10px] font-bold uppercase text-[#8F8982]">Total Flagged Intake</p>
          <p className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">{summary.total}</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">2,836 raw pool minus 2,416 canonical</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 shadow-card">
          <p className="text-[10px] font-bold uppercase text-amber-800">Pending Verification</p>
          <p className="text-2xl font-serif font-bold text-amber-900 mt-1">{summary.pending}</p>
          <p className="text-[10px] text-amber-700 font-mono mt-0.5">Awaiting desk inspection</p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 shadow-card">
          <p className="text-[10px] font-bold uppercase text-blue-800">Confirmed Duplicates</p>
          <p className="text-2xl font-serif font-bold text-blue-900 mt-1">{summary.resolved}</p>
          <p className="text-[10px] text-blue-700 font-mono mt-0.5">Merged into canonical ID</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 shadow-card">
          <p className="text-[10px] font-bold uppercase text-emerald-800">Marked Distinct</p>
          <p className="text-2xl font-serif font-bold text-emerald-900 mt-1">{summary.dismissed}</p>
          <p className="text-[10px] text-emerald-700 font-mono mt-0.5">Cleared as unique delegates</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          {[
            { id: 'all', label: `All Candidates (${summary.total})` },
            { id: 'pending', label: `Pending (${summary.pending})` },
            { id: 'resolved', label: `Merged (${summary.resolved})` },
            { id: 'dismissed', label: `Distinct (${summary.dismissed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#A3703F] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#6B655E] hover:text-[#1A1A1A] border border-[#E5DFD3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* College Filter */}
          <select
            value={collegeFilter}
            onChange={(e) => {
              setCollegeFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
          >
            <option value="all">All Participating Colleges</option>
            {contingents.map((c) => (
              <option key={c.id} value={c.college}>
                {c.college}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search candidate name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 pl-8 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F]"
            />
            <Search className="w-3.5 h-3.5 text-[#8F8982] absolute left-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-[#8F8982] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#A3703F]" />
          <span>Loading duplicate candidates audit log...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-xs text-red-700">
          Error: {error}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-[#8F8982]">
          No duplicate candidates match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((cand) => {
            const isResolved = cand.status === 'resolved';
            const isDismissed = cand.status === 'dismissed';
            const isPending = cand.status === 'pending';

            const criteriaLabel =
              cand.match_criteria === 'identical_name_college_and_event_registrations'
                ? 'Identical Name, College & Event Registrations'
                : 'Identical Name & Participating College';

            const confidencePct = Math.round(Number(cand.confidence) * 100);

            return (
              <div
                key={cand.id}
                className={`bg-white border rounded-2xl p-5 shadow-card transition-all ${
                  isPending
                    ? 'border-amber-200 hover:border-[#A3703F]'
                    : isResolved
                    ? 'border-blue-200 bg-blue-50/10'
                    : 'border-emerald-200 bg-emerald-50/10'
                }`}
              >
                {/* Top Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EFEBE3] text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-[#A3703F]">{cand.id}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#FAF8F5] border border-[#E5DFD3] text-[#6B655E]">
                      Confidence: {confidencePct}%
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isResolved
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isPending ? 'Pending Audit' : isResolved ? 'Merged Duplicate' : 'Verified Distinct'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#8F8982]">
                    Match Rule: <strong className="text-[#1A1A1A]">{criteriaLabel}</strong>
                  </span>
                </div>

                {/* Comparison Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Primary Record */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Canonical Record (Keep)
                      </span>
                      <span className="font-mono font-bold text-[#1A1A1A]">{cand.primary_id}</span>
                    </div>
                    <p className="font-serif font-bold text-sm text-[#1A1A1A]">{cand.primary_name}</p>
                    <p className="text-[11px] text-[#6B655E] flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#8F8982]" />
                      {cand.primary_college}
                    </p>
                    <div className="text-[10px] font-mono text-[#8F8982] flex items-center gap-2 pt-1 border-t border-[#EFEBE3]">
                      <span>Contact: {cand.primary_contact || 'None'}</span>
                      {cand.primary_tshirt && <span>T-Shirt: {cand.primary_tshirt}</span>}
                    </div>
                  </div>

                  {/* Duplicate Candidate Record */}
                  <div className="p-3.5 rounded-xl bg-amber-50/30 border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Flagged Intake Entry (Inspect)
                      </span>
                      <span className="font-mono font-bold text-[#A3703F]">{cand.duplicate_id}</span>
                    </div>
                    <p className="font-serif font-bold text-sm text-[#1A1A1A]">{cand.duplicate_name}</p>
                    <p className="text-[11px] text-[#6B655E] flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#8F8982]" />
                      {cand.duplicate_college}
                    </p>
                    <div className="text-[10px] font-mono text-[#8F8982] flex items-center gap-2 pt-1 border-t border-amber-200/60">
                      <span>Contact: {cand.duplicate_contact || 'None'}</span>
                      {cand.duplicate_tshirt && <span>T-Shirt: {cand.duplicate_tshirt}</span>}
                    </div>
                  </div>
                </div>

                {/* Audit Context & Reason Note */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEBE3] text-[11px] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="text-[#6B655E] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#A3703F] shrink-0" />
                    <span>
                      {isResolved
                        ? `Merged as duplicate by ${cand.resolved_by || 'Officer'}: "${cand.resolution_note}"`
                        : isDismissed
                        ? `Cleared as distinct delegate by ${cand.resolved_by || 'Officer'}: "${cand.resolution_note}"`
                        : `Flagged automatically because both entries share identical name and college.`}
                    </span>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveModal({ candidate: cand, action: 'keep_distinct' });
                          setActionReason('Verified separate delegate identities via student ID and distinct phone contact');
                        }}
                        disabled={actionLoading === cand.id}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[11px] transition-colors"
                      >
                        Keep Distinct
                      </button>
                      <button
                        onClick={() => {
                          setActiveModal({ candidate: cand, action: 'confirm_canonical' });
                          setActionReason('Confirmed duplicate registration form submission from same participant');
                        }}
                        disabled={actionLoading === cand.id}
                        className="px-2.5 py-1 rounded-lg bg-[#A3703F] hover:bg-[#8C6D36] text-white font-semibold text-[11px] transition-colors shadow-sm"
                      >
                        Confirm Duplicate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD3] text-xs">
            <span className="text-[#6B655E] font-mono">
              Showing {(page - 1) * pageSize + 1} to {Math.min(totalCount, page * pageSize)} of {totalCount} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-white hover:bg-[#FAF8F5] disabled:opacity-50 font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="font-mono text-[#1A1A1A] px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-white hover:bg-[#FAF8F5] disabled:opacity-50 font-semibold flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operational Resolution Audit Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E5DFD3] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-[#1A1A1A] space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Mandatory Operational Audit Reason
              </span>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mt-1.5">
                {activeModal.action === 'confirm_canonical'
                  ? 'Confirm Candidate as Duplicate Submission'
                  : 'Verify Candidate as Distinct Delegate'}
              </h3>
              <p className="text-xs text-[#6B655E] mt-0.5">
                {activeModal.action === 'confirm_canonical'
                  ? `Merging ${activeModal.candidate.duplicate_id} into canonical ID ${activeModal.candidate.primary_id}. This action will be permanently logged in the audit trail.`
                  : `Clearing duplicate flag from ${activeModal.candidate.duplicate_id} to reinstate them as an independent delegate with their own valid credential.`}
              </p>
            </div>

            <form onSubmit={handleExecuteResolution} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#1A1A1A] font-semibold mb-1">
                  Operational Reason (Minimum 5 characters) *
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter specific verification rationale..."
                  className="w-full p-3 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#A3703F] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFEBE3]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setActionReason('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-semibold hover:bg-[#F2ECE1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === activeModal.candidate.id || actionReason.trim().length < 5}
                  className={`px-4 py-1.5 rounded-xl text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5 ${
                    activeModal.action === 'confirm_canonical'
                      ? 'bg-[#A3703F] hover:bg-[#8C6D36]'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  } disabled:opacity-50`}
                >
                  {actionLoading === activeModal.candidate.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : activeModal.action === 'confirm_canonical' ? (
                    'Confirm Merge'
                  ) : (
                    'Mark Distinct Delegate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
