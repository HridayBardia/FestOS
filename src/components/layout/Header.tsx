'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  Flame,
  FileSpreadsheet,
  RefreshCw,
  Hotel,
  Users2,
  AlertTriangle
} from 'lucide-react';
import { useFest } from '@/context/FestContext';

interface HeaderProps {
  onOpenDisruptions: () => void;
  onOpenAuditLogs: () => void;
  onOpenConnectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDisruptions, onOpenAuditLogs, onOpenConnectModal }) => {
  const {
    hostels,
    participantsCount,
    checkedInCount,
    clashes,
    activeDisruptions,
    lastSyncTime,
    refreshData,
    vendors
  } = useFest();

  const [currentTime, setCurrentTime] = useState<string>('11:32:00 AM');
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const totalHostelBeds = hostels.reduce((sum, h) => sum + h.total_capacity, 0);
  const occupiedHostelBeds = hostels.reduce((sum, h) => sum + h.occupied_beds, 0);
  const occupancyPercentage = Math.round((occupiedHostelBeds / (totalHostelBeds || 1)) * 100);

  const vendorAlertsCount = vendors.filter((v) => v.compliance_status !== 'compliant').length;

  return (
    <header className="bg-[#FAF8F5] border-b border-[#E5DFD3] text-[#1A1A1A] sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      {/* Luxury Disruption Alert Banner */}
      {activeDisruptions.length > 0 && (
        <div className="bg-[#FAF0E4] border-b border-[#EED5BC] px-6 py-2.5 flex items-center justify-between text-[#7A4E1D] text-xs font-medium">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-md bg-[#FAF0E4] text-[#A3703F]">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold tracking-wide uppercase mr-2 text-[#7A4E1D]">
                SIMULATION DISRUPTION ACTIVE:
              </span>
              <span className="text-[#6B655E]">
                {activeDisruptions.length} simulated anomaly requiring organizer review and audit logging.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenDisruptions}
            className="px-3 py-1 rounded-lg bg-white text-[#7A4E1D] font-bold hover:bg-[#FAF8F5] border border-[#EED5BC] transition-colors shadow-sm text-xs"
          >
            Review Disruption &rarr;
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left: Campus Info & Day Indicator */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold text-[#1A1A1A] tracking-tight">
                IIM Indore Operations Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A3E]"></span>
                Day 1 Active
              </span>
            </div>
            <p className="text-xs text-[#6B655E]">
              Aarohan 2026 · Prabandh Shikhar, Rau-Pithampur Road
            </p>
          </div>
        </div>

        {/* Center: Metric Badges */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Bed Occupancy */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card">
            <Hotel className="w-3.5 h-3.5 text-[#A3703F]" />
            <div className="text-xs">
              <span className="text-[#8F8982]">Hostels: </span>
              <span className="font-mono font-bold text-[#1A1A1A]">{occupiedHostelBeds}/{totalHostelBeds}</span>
              <span className="ml-1 text-[11px] text-[#A3703F] font-semibold">({occupancyPercentage}%)</span>
            </div>
          </div>

          {/* Check-ins */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card">
            <Users2 className="w-3.5 h-3.5 text-[#2D5A3E]" />
            <div className="text-xs">
              <span className="text-[#8F8982]">Delegates: </span>
              <span className="font-mono font-bold text-[#2D5A3E]">{checkedInCount}</span>
              <span className="text-[#8F8982] text-[11px]"> / {participantsCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Schedule Clashes */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            clashes.length > 0
              ? 'bg-[#FAECEB] border-[#F0C9C7] text-[#7C2D2A]'
              : 'bg-white border-[#E5DFD3] text-[#6B655E]'
          }`}>
            <ShieldAlert className={`w-3.5 h-3.5 ${clashes.length > 0 ? 'text-[#7C2D2A]' : 'text-[#8F8982]'}`} />
            <span>{clashes.length} {clashes.length === 1 ? 'Clash' : 'Clashes'}</span>
          </div>

          {/* Vendor Alerts */}
          {vendorAlertsCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF0E4] border border-[#EED5BC] text-[#7A4E1D] text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7A4E1D]"></span>
              <span>{vendorAlertsCount} Vendor Notice</span>
            </div>
          )}
        </div>

        {/* Right: Actions, Clock & Sync */}
        <div className="flex items-center gap-2.5">
          {/* Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] text-xs font-mono text-[#6B655E] shadow-card">
            <Clock className="w-3.5 h-3.5 text-[#A3703F]" />
            <span suppressHydrationWarning>{hasMounted ? currentTime : '11:32:00 AM'} IST</span>
          </div>

          {/* Audit Log Trigger */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6EFE6] text-[#1A1A1A] text-xs font-medium border border-[#E5DFD3] transition-colors shadow-card"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#A3703F]" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          {/* Disruption Trigger */}
          <button
            onClick={onOpenDisruptions}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 transition-all active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-[#F6EFE6]" />
            <span>Jury Tests</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="p-1.5 rounded-xl bg-white hover:bg-[#F6EFE6] text-[#6B655E] hover:text-[#1A1A1A] border border-[#E5DFD3] transition-colors shadow-card"
            title={`Last sync: ${lastSyncTime}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#A3703F]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
