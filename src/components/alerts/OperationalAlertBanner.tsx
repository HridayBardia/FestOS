'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  X
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { OperationalAlertModal } from './OperationalAlertModal';
import { formatISTTime } from '@/lib/formatters';

interface OperationalAlertBannerProps {
  currentMemberId?: string;
  currentRole?: string;
}

export const OperationalAlertBanner: React.FC<OperationalAlertBannerProps> = ({
  currentMemberId = 'ST08',
  currentRole = 'director'
}) => {
  const {
    operationalAlerts,
    acknowledgeOperationalAlert
  } = useFest();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'feed' | 'broadcast'>('feed');
  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState<boolean>(false);

  const activeAlerts = operationalAlerts.filter((a) => a.status !== 'resolved');

  // Keep index within bounds if active alerts change
  useEffect(() => {
    if (currentIndex >= activeAlerts.length && activeAlerts.length > 0) {
      setCurrentIndex(activeAlerts.length - 1);
    }
  }, [activeAlerts.length, currentIndex]);

  if (activeAlerts.length === 0 || isDismissedTemporarily) {
    return (
      <>
        {/* Subtle dormant status pill with Broadcast button */}
        <div className="bg-[#FAF8F5] border-b border-[#E5DFD3] px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-[#6B655E]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-serif font-bold text-[#1A1A1A]">Operational Incident Telemetry:</span>
            <span className="text-[11px] text-[#8F8982]">All 8 desks synchronized · Zero blocking event alerts</span>
          </div>

          <button
            onClick={() => {
              setModalTab('broadcast');
              setIsModalOpen(true);
            }}
            className="px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-white text-[#A3703F] border border-[#E5DFD3] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-[#A3703F]" />
            <span>Broadcast Incident Alert</span>
          </button>

          <OperationalAlertModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialTab={modalTab}
            currentMemberId={currentMemberId}
            currentMemberRole={currentRole}
          />
        </div>
      </>
    );
  }

  const currentAlert = activeAlerts[currentIndex] || activeAlerts[0];
  const isCritical = currentAlert.severity === 'critical';
  const isHigh = currentAlert.severity === 'high';
  const isAcknowledged = currentAlert.acknowledgedBy.includes(currentMemberId);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  };

  const bannerBg = isCritical
    ? 'bg-[#FAECEB] border-[#F0C9C7] text-[#7C2D2A]'
    : isHigh
    ? 'bg-[#FAF0E4] border-[#EED5BC] text-[#7A4E1D]'
    : 'bg-[#F2F7F9] border-[#D4E4EB] text-[#2B5661]';

  return (
    <>
      <div className={`border-b px-4 sm:px-8 py-2.5 transition-all duration-200 shadow-xs ${bannerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left Block: Alert Tag, Code, Event, Problem Statement */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isCritical
                  ? 'bg-red-700 text-white animate-pulse'
                  : isHigh
                  ? 'bg-amber-700 text-white'
                  : 'bg-blue-700 text-white'
              }`}>
                <Radio className="w-3 h-3 text-white" />
                {currentAlert.severity.toUpperCase()}
              </span>

              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-black/10">
                {currentAlert.alertCode}
              </span>
            </div>

            {/* Affected Event & Problem details */}
            <div className="flex items-center gap-2 truncate">
              {currentAlert.eventName && (
                <span className="font-bold underline decoration-dotted shrink-0">
                  {currentAlert.eventName}
                  {currentAlert.venueName ? ` (${currentAlert.venueName})` : ''}:
                </span>
              )}
              <span className="font-medium truncate text-[#1A1A1A]">
                {currentAlert.title}
              </span>
              <span className="hidden lg:inline text-[11px] opacity-80 truncate">
                · {currentAlert.requiredAction}
              </span>
            </div>
          </div>

          {/* Right Block: Controls, Ack, Incident Center Button */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {/* Pager if multiple alerts */}
            {activeAlerts.length > 1 && (
              <div className="flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded border border-black/10 text-[10px] font-mono font-bold mr-1">
                <button
                  onClick={handlePrev}
                  className="p-0.5 hover:bg-black/10 rounded transition-colors"
                  title="Previous Alert"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span>{currentIndex + 1}/{activeAlerts.length}</span>
                <button
                  onClick={handleNext}
                  className="p-0.5 hover:bg-black/10 rounded transition-colors"
                  title="Next Alert"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Ack */}
            {!isAcknowledged ? (
              <button
                onClick={() => acknowledgeOperationalAlert(currentAlert.id, currentMemberId)}
                className="px-2.5 py-1 rounded bg-white/90 hover:bg-white text-[#1A1A1A] font-bold text-[11px] border border-black/15 shadow-xs flex items-center gap-1 transition-all"
                title="Acknowledge you have seen this alert"
              >
                <CheckCheck className="w-3 h-3 text-[#2D5A3E]" />
                <span>Ack</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                ✓ Acknowledged
              </span>
            )}

            {/* Incident Center Button */}
            <button
              onClick={() => {
                setModalTab('feed');
                setIsModalOpen(true);
              }}
              className="px-3 py-1 rounded bg-black/80 hover:bg-black text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1"
            >
              <span>Incident Center ({activeAlerts.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Broadcast New Incident */}
            <button
              onClick={() => {
                setModalTab('broadcast');
                setIsModalOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-white hover:bg-neutral-100 text-[#7C2D2A] border border-[#F0C9C7] font-bold text-[11px] transition-all shadow-xs flex items-center gap-1"
              title="Broadcast an urgent event issue to all 8 dashboards"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          </div>
        </div>
      </div>

      <OperationalAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        currentMemberId={currentMemberId}
        currentMemberRole={currentRole}
      />
    </>
  );
};
