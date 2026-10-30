'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { AccommodationView } from '@/components/accommodation/AccommodationView';
import { ParticipantsView } from '@/components/participants/ParticipantsView';
import { ScheduleClashView } from '@/components/schedule/ScheduleClashView';
import { LogisticsView } from '@/components/logistics/LogisticsView';
import { DisruptionInjectorView } from '@/components/disruptions/DisruptionInjectorView';
import { AuditLogModal } from '@/components/audit/AuditLogModal';
import { SupabaseConnectModal } from '@/components/common/SupabaseConnectModal';

export default function FestOSPage() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF8F5] text-[#1A1A1A]">
        <div className="text-center space-y-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#A3703F] via-[#8C6D36] to-[#6E5325] text-white flex items-center justify-center mx-auto text-xl shadow-md font-serif font-bold">
            🏛
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">FestOS — Aarohan 2026</h2>
            <p className="text-xs text-[#8F8982]">Loading Operations Command Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] text-[#1A1A1A] font-sans">
      {/* Editorial Organizer Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Executive Header */}
        <Header
          onOpenDisruptions={() => setCurrentTab('disruptions')}
          onOpenAuditLogs={() => setIsAuditModalOpen(true)}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />

        {/* View Content Port */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <OverviewDashboard
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenDisruptions={() => setCurrentTab('disruptions')}
              />
            )}

            {currentTab === 'accommodation' && <AccommodationView />}

            {currentTab === 'participants' && <ParticipantsView />}

            {currentTab === 'schedule' && <ScheduleClashView />}

            {currentTab === 'logistics' && <LogisticsView />}

            {currentTab === 'disruptions' && <DisruptionInjectorView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <SupabaseConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
}
