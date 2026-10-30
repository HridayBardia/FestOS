'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  constraintWarning: string;
  participantName: string;
  targetLocation: string;
  onConfirmOverride: (reason: string, approvedBy: string) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  constraintWarning,
  participantName,
  targetLocation,
  onConfirmOverride,
}) => {
  const [reason, setReason] = useState('');
  const [approvedBy, setApprovedBy] = useState('Prof. Animesh Sen (Director)');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      setError('A detailed operational reason (min 10 characters) is strictly mandatory for overrides_audit_log compliance.');
      return;
    }
    setError('');
    onConfirmOverride(reason, approvedBy);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-[#1A1A1A]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD3]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]">
              <AlertTriangle className="w-5 h-5 text-[#7A4E1D]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Constraint Violation Flagged</h3>
              <p className="text-xs text-[#6B655E]">Mandatory Override Authorization Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8F8982] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Violation Warning Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAECEB] border border-[#F0C9C7] text-xs text-[#7C2D2A] leading-relaxed">
          <strong className="block font-bold mb-1 uppercase tracking-wide text-[10px]">Policy Exception:</strong>
          {constraintWarning}
        </div>

        {/* Entity Summary */}
        <div className="mt-4 text-xs space-y-1.5 text-[#6B655E] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD3]">
          <div>
            <span className="text-[#8F8982]">Target Delegate: </span>
            <span className="font-bold text-[#1A1A1A]">{participantName}</span>
          </div>
          <div>
            <span className="text-[#8F8982]">Target Facility: </span>
            <span className="font-bold text-[#A3703F]">{targetLocation}</span>
          </div>
          <div>
            <span className="text-[#8F8982]">Audit Destination: </span>
            <span className="text-[#2D5A3E] font-mono text-[11px] font-semibold">`overrides_audit_log` (PostgreSQL)</span>
          </div>
        </div>

        {/* Override Justification Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Mandatory Operational Justification *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Authorized ground floor priority allocation; medical brace support verified by campus health team."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] placeholder:text-[#8F8982] resize-none font-medium shadow-sm"
            />
            {error && <p className="text-[11px] text-[#7C2D2A] mt-1 font-semibold">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Approving Authority / Core Team Officer *
            </label>
            <select
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] shadow-sm font-medium"
            >
              <option value="Prof. Animesh Sen (Director)">Prof. Animesh Sen (Director)</option>
              <option value="Samarth Kulkarni (Ops Head)">Samarth Kulkarni (Ops Head)</option>
              <option value="Divya Agarwal (Hospitality Lead)">Divya Agarwal (Hospitality Lead)</option>
              <option value="Major R.K. Bhonsle (Security Chief)">Major R.K. Bhonsle (Security Chief)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#6B655E] text-xs font-semibold border border-[#E5DFD3] transition-colors"
            >
              Cancel Allocation
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize & Log to Supabase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
