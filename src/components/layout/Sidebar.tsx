'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Truck,
  Radio,
  Flame,
  Shirt,
  UtensilsCrossed,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { RoleKey, PERMISSION_MATRIX, ROLES } from '@/config/roles';

export interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenConnectModal?: () => void;
  role?: RoleKey;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenConnectModal,
  role = 'director',
}) => {
  const { clashes, activeDisruptions, coreTeam, participantsCount } = useFest();

  const permissions = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.director;
  const roleDef = ROLES[role] || ROLES.director;

  const isDirector = role === 'director';

  // Sector-specific tabs strictly tailored to the authenticated department
  const allNavItems = [
    {
      id: 'dashboard',
      label: isDirector ? 'Executive Overview' : `${roleDef.name} Desk`,
      subtitle: isDirector ? 'Real-time telemetry' : `${roleDef.department} operations`,
      icon: LayoutDashboard,
      badge: null,
      visible: true,
    },
    {
      id: 'participants',
      label: isDirector ? 'Contingents & Rosters' : 'Delegate Check-In Roster',
      subtitle: `${participantsCount.toLocaleString()} delegates`,
      icon: Users,
      badge: null,
      visible: isDirector || role === 'registration',
    },
    {
      id: 'duplicates',
      label: 'Flagged Intake Audit',
      subtitle: '420 candidates under review',
      icon: ShieldAlert,
      badge: '420 Flagged',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      visible: isDirector || role === 'registration',
    },
    {
      id: 'accommodation',
      label: 'Accommodation Grid',
      subtitle: 'Hostels & external stays',
      icon: Building2,
      badge: null,
      visible: isDirector || role === 'hospitality',
    },
    {
      id: 'schedule',
      label: 'Schedule & Clashes',
      subtitle: 'Timeline & venue matrix',
      icon: CalendarDays,
      badge: clashes.length > 0 ? `${clashes.length} Clashes` : null,
      badgeColor: 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]',
      visible: isDirector || role === 'events',
    },
    {
      id: 'logistics',
      label: 'Logistics Depot',
      subtitle: 'Equipment & venues depot',
      icon: Truck,
      badge: null,
      visible: isDirector || role === 'logistics',
    },
    {
      id: 'disruptions',
      label: 'Disruption Harness',
      subtitle: 'Live stress testing',
      icon: Flame,
      badge: activeDisruptions.length > 0 ? `${activeDisruptions.length} Active` : null,
      badgeColor: 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC] animate-pulse',
      visible: isDirector,
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.visible);

  return (
    <aside className="w-72 bg-[#F5F2EC] border-r border-[#E5DFD3] flex flex-col h-screen shrink-0 text-[#1A1A1A] select-none shadow-[1px_0_12px_rgba(0,0,0,0.015)]">
      {/* Brand & Editorial Masthead */}
      <div className="p-6 border-b border-[#E5DFD3] bg-[#FAF8F5]">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#A3703F] via-[#8C6D36] to-[#6E5325] flex items-center justify-center shadow-md shadow-[#A3703F]/20 text-white font-serif font-bold text-lg tracking-wider">
            🏛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#1A1A1A] text-xl tracking-tight">FestOS</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                2026
              </span>
            </div>
            <p className="text-[11px] text-[#8F8982] uppercase tracking-wider font-mono font-medium mt-0.5">
              Aarohan · IIM Indore
            </p>
          </div>
        </div>

        {/* Active Department Sector Badge */}
        <div className="mt-4 pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8F8982]">Department</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleDef.badgeColor}`}>
            {roleDef.name}
          </span>
        </div>
      </div>

      {/* Role-Specific Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#8F8982]">
          {roleDef.department} Portal
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-white text-[#1A1A1A] shadow-luxury border border-[#E5DFD3] font-semibold'
                  : 'text-[#6B655E] hover:text-[#1A1A1A] hover:bg-white/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-[#F6EFE6] text-[#A3703F]' : 'text-[#8F8982] group-hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block truncate text-xs">{item.label}</span>
                  <span className="block text-[10px] font-normal text-[#8F8982] truncate">{item.subtitle}</span>
                </div>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-[#F6EFE6] text-[#A3703F]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sector Walkie Channel Dispatch */}
      <div className="p-4 border-t border-[#E5DFD3] bg-[#FAF8F5]/80">
        <div className="flex items-center justify-between text-xs text-[#6B655E] mb-2 font-mono">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#A3703F]" />
            <span className="uppercase tracking-wider font-semibold text-[10px]">Active Shift</span>
          </div>
          <span className="text-[#2D5A3E] font-bold text-[10px]">{roleDef.defaultShift}</span>
        </div>
        <div className="px-2.5 py-2 rounded-lg bg-white border border-[#E5DFD3] shadow-sm text-xs">
          <p className="text-[11px] font-semibold text-[#1A1A1A]">{roleDef.name} Channel</p>
          <p className="text-[10px] text-[#8F8982] line-clamp-1">{roleDef.description}</p>
        </div>
      </div>
    </aside>
  );
};