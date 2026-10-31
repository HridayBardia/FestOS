'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
  Hotel,
  Users2,
  AlertTriangle,
  LogOut,
  UtensilsCrossed,
  Truck,
  Shirt,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { RoleKey, ROLES } from '@/config/roles';

export interface HeaderProps {
  onOpenDisruptions?: () => void;
  onOpenAuditLogs: () => void;
  onOpenConnectModal?: () => void;
  memberId?: string;
  name?: string;
  role?: RoleKey;
  shift?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDisruptions,
  onOpenAuditLogs,
  onOpenConnectModal,
  memberId: initialMemberId,
  name: initialName,
  role: initialRole,
  shift: initialShift,
}) => {
  const router = useRouter();
  const {
    hostels,
    participantsCount,
    checkedInCount,
    clashes,
    activeDisruptions,
    lastSyncTime,
    refreshData,
    vendors,
    auditCount
  } = useFest();

  const [currentTime, setCurrentTime] = useState<string>('11:32:00 AM');
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [liveAuditCount, setLiveAuditCount] = useState<number>(auditCount || 2);

  const fetchLiveAuditCount = useCallback(async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.logs)) {
          setLiveAuditCount(json.logs.length);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchLiveAuditCount();
    const interval = setInterval(fetchLiveAuditCount, 3000);
    const handleUpdate = () => fetchLiveAuditCount();
    window.addEventListener('festos_audit_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('festos_audit_updated', handleUpdate);
    };
  }, [fetchLiveAuditCount]);

  useEffect(() => {
    if (auditCount && auditCount > liveAuditCount) {
      setLiveAuditCount(auditCount);
    }
  }, [auditCount]);

  // User state
  const [userName, setUserName] = useState<string>(initialName || '');
  const [userMemberId, setUserMemberId] = useState<string>(initialMemberId || '');
  const [userRole, setUserRole] = useState<RoleKey>((initialRole as RoleKey) || 'director');
  const [userShift, setUserShift] = useState<string>(initialShift || '');

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setHasMounted(true);

    if (!initialName || !initialMemberId) {
      fetch('/api/auth/session')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            setUserName(data.name || '');
            setUserMemberId(data.memberId || '');
            if (data.role) setUserRole(data.role as RoleKey);
            if (data.shift) setUserShift(data.shift);
          }
        })
        .catch(() => {});
    }

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
  }, [initialName, initialMemberId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const totalHostelBeds = hostels.reduce((sum, h) => sum + h.total_capacity, 0);
  const occupiedHostelBeds = hostels.reduce((sum, h) => sum + h.occupied_beds, 0);
  const occupancyPercentage = Math.round((occupiedHostelBeds / (totalHostelBeds || 1)) * 100);
  const vendorAlertsCount = vendors.filter((v) => v.compliance_status !== 'compliant').length;

  const currentRoleDef = ROLES[userRole] || ROLES.director;

  return (
    <header className="bg-[#FAF8F5] border-b border-[#E5DFD3] text-[#1A1A1A] sticky top-0 z-30 shadow-sm w-full max-w-full">
      {/* Simulation Alert Banner */}
      {activeDisruptions.length > 0 && (
        <div className="bg-[#FAF0E4] border-b border-[#EED5BC] px-4 sm:px-6 py-2 flex items-center justify-between text-[#7A4E1D] text-xs font-medium">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-[#A3703F] animate-pulse shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#7A4E1D] shrink-0">
              DISRUPTION ACTIVE:
            </span>
            <span className="text-[#6B655E] text-xs truncate">
              {activeDisruptions.length} scenario in effect requiring operational review.
            </span>
          </div>
          {onOpenDisruptions && (
            <button
              onClick={onOpenDisruptions}
              className="px-2.5 py-1 rounded-md bg-white text-[#7A4E1D] font-bold hover:bg-[#FAF8F5] border border-[#EED5BC] text-xs transition-colors shadow-sm shrink-0 ml-3"
            >
              Review &rarr;
            </button>
          )}
        </div>
      )}

      {/* Main Header Container: 3 Responsively Protected Sections */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 min-h-[62px] w-full max-w-full">
        
        {/* SECTION 1: Brand & Department Title (Always locked to left) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] whitespace-nowrap">
                {currentRoleDef.department}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF3EC] text-[#2D5A3E] border border-[#C7E2CE] whitespace-nowrap hidden sm:inline-block">
                Day 1 Active
              </span>
            </div>
            <p className="text-[11px] text-[#8F8982] whitespace-nowrap">
              Aarohan 2026 · IIM Indore Command
            </p>
          </div>
        </div>

        {/* SECTION 2: Role-Specific Metrics (Scrollable & Contained so it never overflows) */}
        <div className="hidden lg:flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0 flex-1 justify-center px-2 py-1">
          {/* Registration / Director */}
          {(userRole === 'director' || userRole === 'registration') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card shrink-0">
              <Users2 className="w-3.5 h-3.5 text-[#2D5A3E]" />
              <div className="text-xs whitespace-nowrap">
                <span className="text-[#8F8982]">Checked In: </span>
                <span className="font-mono font-bold text-[#2D5A3E]">{checkedInCount}</span>
                <span className="text-[#8F8982] text-[11px]"> / {participantsCount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Hospitality / Director */}
          {(userRole === 'director' || userRole === 'hospitality') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card shrink-0">
              <Hotel className="w-3.5 h-3.5 text-[#A3703F]" />
              <div className="text-xs whitespace-nowrap">
                <span className="text-[#8F8982]">Hostels: </span>
                <span className="font-mono font-bold text-[#1A1A1A]">{occupiedHostelBeds}/{totalHostelBeds}</span>
                <span className="ml-1 text-[11px] text-[#A3703F] font-semibold">({occupancyPercentage}%)</span>
              </div>
            </div>
          )}

          {/* Events / Director */}
          {(userRole === 'director' || userRole === 'events') && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 ${
              clashes.length > 0
                ? 'bg-[#FAECEB] border-[#F0C9C7] text-[#7C2D2A]'
                : 'bg-white border-[#E5DFD3] text-[#6B655E]'
            }`}>
              <ShieldAlert className={`w-3.5 h-3.5 ${clashes.length > 0 ? 'text-[#7C2D2A]' : 'text-[#8F8982]'}`} />
              <span>{clashes.length} {clashes.length === 1 ? 'Clash' : 'Clashes'}</span>
            </div>
          )}

          {/* Food / Director */}
          {(userRole === 'director' || userRole === 'food') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card text-xs whitespace-nowrap shrink-0">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#7A4E1D]" />
              <span className="text-[#8F8982]">Vendors:</span>
              <span className="font-bold text-[#1A1A1A]">15 Active</span>
              {vendorAlertsCount > 0 && (
                <span className="text-[#7A4E1D] font-bold text-[11px]">({vendorAlertsCount} alerts)</span>
              )}
            </div>
          )}

          {/* Logistics / Director */}
          {(userRole === 'director' || userRole === 'logistics') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card text-xs whitespace-nowrap shrink-0">
              <Truck className="w-3.5 h-3.5 text-[#2B5661]" />
              <span className="text-[#8F8982]">AV Gear:</span>
              <span className="font-bold text-[#2B5661]">All Venues Dispatched</span>
            </div>
          )}

          {/* Merch / Director */}
          {(userRole === 'director' || userRole === 'merch') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] shadow-card text-xs whitespace-nowrap shrink-0">
              <Shirt className="w-3.5 h-3.5 text-[#A3703F]" />
              <span className="text-[#8F8982]">Kit Desk:</span>
              <span className="font-bold text-[#1A1A1A]">S, M, L, XL Ready</span>
            </div>
          )}
        </div>

        {/* SECTION 3: Right Controls & Dropdown Menu (Always visible, never clipped) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* Direct IST Clock (Visible on 2xl screens for fast glance) */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD3] text-xs font-mono text-[#6B655E] shadow-card whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-[#A3703F]" />
            <span suppressHydrationWarning>{hasMounted ? currentTime : '11:32:00 AM'} IST</span>
          </div>

          {/* Direct Audit Log Trigger Button (Visible across all viewports) */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6EFE6] text-[#1A1A1A] text-xs font-medium border border-[#E5DFD3] transition-colors shadow-card whitespace-nowrap"
            title="View Central Audit Trail (Live Shared Across All 48 Members)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#A3703F]" />
            <span className="hidden md:inline">Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#FAF0E4] text-[#A3703F] border border-[#EED5BC]">
              {liveAuditCount}
            </span>
          </button>

          {/* Direct Telemetry Refresh Button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-white hover:bg-[#F6EFE6] text-[#6B655E] hover:text-[#1A1A1A] border border-[#E5DFD3] transition-colors shadow-card shrink-0"
            title={`Last sync: ${lastSyncTime}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A3703F]' : ''}`} />
          </button>

          {/* USER PROFILE DROPDOWN MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-xl border transition-all shadow-card ${
                isUserMenuOpen
                  ? 'bg-[#F5EFE6] border-[#A3703F] ring-2 ring-[#A3703F]/20'
                  : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD3]'
              }`}
              aria-label="User account and navigation menu"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              {/* User Avatar Circle */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A3703F] to-[#7A4E1D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                {userName ? userName.charAt(0) : 'U'}
              </div>

              {/* Name & ID (Hidden on narrow screens, visible on sm+) */}
              <div className="hidden sm:block text-left text-xs leading-snug">
                <p className="font-bold text-[#1A1A1A] truncate max-w-[120px]">
                  {userName || 'Core Member'}
                </p>
                <p className="text-[10px] text-[#8F8982] font-mono whitespace-nowrap">
                  {userMemberId || 'ST00'} · {currentRoleDef.name}
                </p>
              </div>

              {/* Animated Chevron Down */}
              <ChevronDown
                className={`w-4 h-4 text-[#8F8982] transition-transform duration-200 shrink-0 ${
                  isUserMenuOpen ? 'rotate-180 text-[#A3703F]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E5DFD3] rounded-2xl shadow-2xl p-3 z-50 text-[#1A1A1A] animate-in fade-in zoom-in-95 duration-150">
                {/* User Identity Card */}
                <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD3] mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3703F] to-[#7A4E1D] text-white flex items-center justify-center font-bold text-base uppercase shadow-sm shrink-0">
                    {userName ? userName.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif font-bold text-sm text-[#1A1A1A] truncate">
                      {userName || 'Core Member'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]">
                        {userMemberId || 'ST00'}
                      </span>
                      <span className="text-[11px] text-[#6B655E] truncate">
                        {currentRoleDef.name}
                      </span>
                    </div>
                    {userShift && (
                      <p className="text-[10px] text-[#8F8982] mt-1 font-mono">
                        Shift: {userShift} (Active)
                      </p>
                    )}
                  </div>
                </div>

                {/* Live IST Clock */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EFEBE3] text-xs text-[#6B655E] mb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#A3703F]" />
                    <span>IST Time</span>
                  </div>
                  <span className="font-bold text-[#1A1A1A]" suppressHydrationWarning>
                    {hasMounted ? currentTime : '11:32:00 AM'}
                  </span>
                </div>

                <div className="border-t border-[#EFEBE3] my-2" />

                {/* Dropdown Menu Items */}
                <div className="space-y-1">
                  {/* Central Master Audit Trail */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuditLogs();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs text-[#1A1A1A] font-medium transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#A3703F]" />
                      <span>Central Audit Trail</span>
                    </div>
                    <span className="text-[10px] text-[#8F8982] font-mono">Ledger</span>
                  </button>

                  {/* Manual Telemetry Sync */}
                  <button
                    onClick={() => {
                      handleManualRefresh();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs text-[#1A1A1A] font-medium transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className={`w-4 h-4 text-[#A3703F] ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Sync Telemetry</span>
                    </div>
                    <span className="text-[10px] text-[#8F8982] font-mono">{lastSyncTime}</span>
                  </button>
                </div>

                <div className="border-t border-[#EFEBE3] my-2" />

                {/* Sign Out Button (Always Accessible, Prominent & Distinct) */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAECEB] hover:bg-[#F5D8D6] text-[#7C2D2A] text-xs font-bold border border-[#F0C9C7] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  title="Terminate session and sign out"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-[#7C2D2A]" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono">Exit</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Sign Out Button on Ultra-wide Displays (2xl+) */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAECEB] hover:bg-[#F5D8D6] text-[#7C2D2A] text-xs font-bold border border-[#F0C9C7] transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
            title="Terminate session and sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-[#7C2D2A]" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
