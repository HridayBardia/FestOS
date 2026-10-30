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
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFest } from '@/context/FestContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenConnectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onOpenConnectModal }) => {
  const { clashes, activeDisruptions, isUsingRemoteSupabase, coreTeam, participantsCount } = useFest();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Command Overview',
      subtitle: 'Real-time telemetry',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'accommodation',
      label: 'Accommodation Grid',
      subtitle: 'Hostels & external stays',
      icon: Building2,
      badge: null,
    },
    {
      id: 'participants',
      label: 'Contingents & Rosters',
      subtitle: `${participantsCount.toLocaleString()} delegates`,
      icon: Users,
      badge: null,
    },
    {
      id: 'schedule',
      label: 'Schedule & Clashes',
      subtitle: 'Timeline & venue matrix',
      icon: CalendarDays,
      badge: clashes.length > 0 ? `${clashes.length} Clashes` : null,
      badgeColor: 'bg-[#FAECEB] text-[#7C2D2A] border border-[#F0C9C7]',
    },
    {
      id: 'logistics',
      label: 'Logistics & Vendors',
      subtitle: 'Hygiene & equipment depot',
      icon: Truck,
      badge: null,
    },
    {
      id: 'disruptions',
      label: 'Disruption Testing',
      subtitle: 'Jury injection harness',
      icon: Flame,
      badge: activeDisruptions.length > 0 ? `${activeDisruptions.length} Active` : 'Jury Mode',
      badgeColor: activeDisruptions.length > 0
        ? 'bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC] animate-pulse'
        : 'bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]',
    },
  ];

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
            <p className="text-[11px] text-[#6B655E] font-medium tracking-wide">
              IIM Indore · Aarohan Directorate
            </p>
          </div>
        </div>

        {/* Supabase Connection Status Pill */}
        <button
          onClick={onOpenConnectModal}
          className="mt-4 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E5DFD3] hover:border-[#A3703F]/50 transition-all text-xs group shadow-sm text-left"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isUsingRemoteSupabase ? 'bg-[#2D5A3E]' : 'bg-[#A3703F]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isUsingRemoteSupabase ? 'bg-[#2D5A3E]' : 'bg-[#A3703F]'}`}></span>
            </span>
            <span className="text-[11px] font-medium text-[#1A1A1A] group-hover:text-[#A3703F] transition-colors">
              {isUsingRemoteSupabase ? 'Supabase Live' : 'Supabase Client'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#A3703F] bg-[#F6EFE6] px-1.5 py-0.5 rounded border border-[#E5DFD3]">
            Config
          </span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#8F8982]">
          Operations Directorate
        </div>
        {navItems.map((item) => {
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Core Team Walkie Channel Dispatch */}
      <div className="p-4 border-t border-[#E5DFD3] bg-[#FAF8F5]/80">
        <div className="flex items-center justify-between text-xs text-[#6B655E] mb-2 font-mono">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#A3703F]" />
            <span className="uppercase tracking-wider font-semibold text-[10px]">Dispatch Channel</span>
          </div>
          <span className="text-[#2D5A3E] font-bold text-[10px]">OPS 02</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {coreTeam.slice(0, 2).map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DFD3] shadow-sm"
            >
              <div className="truncate pr-2">
                <p className="text-[#1A1A1A] font-semibold text-[11px] truncate">{member.name}</p>
                <p className="text-[10px] text-[#8F8982] capitalize">{member.role.replace('_', ' ')}</p>
              </div>
              <span className="text-[10px] font-mono text-[#A3703F] bg-[#F6EFE6] px-1.5 py-0.5 rounded border border-[#E5DFD3] shrink-0 font-bold">
                {member.walkie_channel.split(' ')[0]} {member.walkie_channel.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
