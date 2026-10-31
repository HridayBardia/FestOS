'use client';

import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { WIDGET_REGISTRY_META } from '@/config/dashboards';

interface WidgetCardProps {
  widgetId: string;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widgetId,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No active records found.',
  children,
  headerAction,
  className = ''
}) => {
  const meta = WIDGET_REGISTRY_META[widgetId] || {
    id: widgetId,
    title: widgetId,
    description: '',
    category: 'metric',
    gridSpan: 'half',
    refreshIntervalSeconds: 20
  };

  const spanClass =
    meta.gridSpan === 'full'
      ? 'col-span-1 lg:col-span-12'
      : meta.gridSpan === 'third'
      ? 'col-span-1 lg:col-span-4'
      : 'col-span-1 lg:col-span-6';

  const categoryBadgeColors: Record<string, string> = {
    metric: 'bg-[#F6EFE6] text-[#A3703F] border-[#E5DFD3]',
    action: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    matrix: 'bg-blue-50 text-blue-800 border-blue-200',
    feed: 'bg-amber-50 text-amber-800 border-amber-200',
    tool: 'bg-purple-50 text-purple-800 border-purple-200'
  };

  return (
    <div
      className={`bg-white border border-[#E5DFD3] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-luxury flex flex-col justify-between transition-all duration-200 hover:shadow-luxuryHover ${spanClass} ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#EFEBE3] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                categoryBadgeColors[meta.category] || categoryBadgeColors.metric
              }`}
            >
              {meta.category}
            </span>
            <span className="text-[10px] text-[#8F8982] font-mono">
              Live (20s poll)
            </span>
          </div>
          <h3 className="font-serif text-base font-bold text-[#1A1A1A] tracking-tight">
            {meta.title}
          </h3>
          {meta.description && (
            <p className="text-xs text-[#6B655E] mt-0.5 line-clamp-1">
              {meta.description}
            </p>
          )}
        </div>

        {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
      </div>

      {/* Widget Body State Handling */}
      <div className="flex-1 min-h-[140px] flex flex-col justify-center">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#8F8982] space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#A3703F]" />
            <p className="text-xs font-mono">Querying database view...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Query Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="py-10 flex flex-col items-center justify-center text-[#8F8982] space-y-1.5 text-center">
            <Inbox className="w-6 h-6 text-[#8F8982]" />
            <p className="text-xs font-medium text-[#6B655E]">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

