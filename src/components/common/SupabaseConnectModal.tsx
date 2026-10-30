'use client';

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { getStoredCredentials } from '@/lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const { isUsingRemoteSupabase, connectSupabase, refreshData } = useFest();
  const initial = getStoredCredentials();

  const [url, setUrl] = useState(initial.url || '');
  const [key, setKey] = useState(initial.key || '');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    const success = await connectSupabase(url, key);
    setIsSubmitting(false);

    if (success) {
      setStatusMsg({ type: 'success', text: 'Successfully authenticated & connected to Supabase live database!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: 'Could not connect. Please check your Supabase Project URL and Anon API Key.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-[#1A1A1A]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD3]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Supabase Connection Setup</h3>
              <p className="text-xs text-[#6B655E]">Configure live PostgreSQL & Realtime WebSockets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8F8982] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs space-y-1 text-[#6B655E]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1A1A1A]">Current Status:</span>
            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
              isUsingRemoteSupabase ? 'bg-[#EAF3EC] text-[#2D5A3E]' : 'bg-[#FAF0E4] text-[#7A4E1D]'
            }`}>
              {isUsingRemoteSupabase ? '● CONNECTED TO CLOUD' : '○ SIMULATED / RECALIBRATING'}
            </span>
          </div>
          <p className="text-[11px] pt-1">
            Queries `participants` (2,836 rows), `hostels`, `contingents`, `events`, and commits overrides to `overrides_audit_log`.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">
              NEXT_PUBLIC_SUPABASE_URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] font-mono shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">
              NEXT_PUBLIC_SUPABASE_KEY (anon public key)
            </label>
            <textarea
              rows={2}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F] font-mono shadow-sm resize-none"
              required
            />
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]'
                : 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#6B655E] text-xs font-semibold border border-[#E5DFD3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

