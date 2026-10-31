'use client';

// FestOS Role Dashboard View Component
// Role-specific operational control dashboard
// Zero em dashes or en dashes in any UI copy or code

import React, { useState } from 'react';
import { RoleKey, ROLES } from '@/config/roles';
import { ROLE_DASHBOARDS } from '@/config/dashboards';
import { WidgetRegistry } from '@/components/widgets/WidgetRegistry';
import { Clock, RefreshCw } from 'lucide-react';

interface RoleDashboardViewProps {
  currentRole: RoleKey;
}

export const RoleDashboardView: React.FC<RoleDashboardViewProps> = ({ currentRole }) => {
  const roleDef = ROLES[currentRole] || ROLES.director;
  const widgetIds = ROLE_DASHBOARDS[currentRole] || [];
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('festos_audit_updated'));
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Role Masthead Banner */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-7 shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F6EFE6]/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${roleDef.badgeColor}`}
              >
                {roleDef.name}
              </span>
              <span className="text-xs text-[#8F8982] font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#A3703F]" /> Assigned Shift: {roleDef.defaultShift}
              </span>
              <span className="text-xs text-[#8F8982] font-mono">| {roleDef.department}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              {roleDef.name} Control Portal
            </h2>
            <p className="text-sm text-[#6B655E] mt-1 max-w-2xl leading-relaxed">
              {roleDef.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <button
              onClick={triggerRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] hover:bg-[#F6EFE6] text-[#6B655E] transition-colors text-xs font-semibold shadow-sm"
              title="Manual telemetry refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A3703F]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

        {/* Stable Widget Grid Layout - No automatic DOM teardown/remount */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {widgetIds.map((wId) => (
            <WidgetRegistry
              key={`${wId}-${refreshKey}`}
              widgetId={wId}
              role={currentRole}
              onRefreshTrigger={triggerRefresh}
            />
          ))}
        </div>
      </div>
      );
};
