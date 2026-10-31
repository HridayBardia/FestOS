'use client';

// FestOS Portal Client Shell
// Interactive role dashboard and deep view tab container
// Zero em dashes or en dashes in any UI copy or code

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleDashboardView } from '@/components/dashboard/RoleDashboardView';
import { AccommodationView } from '@/components/accommodation/AccommodationView';
import { ExternalStaysView } from '@/components/accommodation/ExternalStaysView';
import { ParticipantsView } from '@/components/participants/ParticipantsView';
import { FlaggedDuplicatesView } from '@/components/duplicates/FlaggedDuplicatesView';
import { ScheduleClashView } from '@/components/schedule/ScheduleClashView';
import { LogisticsView } from '@/components/logistics/LogisticsView';
import { DisruptionInjectorView } from '@/components/disruptions/DisruptionInjectorView';
import { AuditLogModal } from '@/components/audit/AuditLogModal';
import { OperationalAlertBanner } from '@/components/alerts/OperationalAlertBanner';
import { SessionPayload } from '@/lib/jwt';

interface PortalClientProps {
  session: SessionPayload;
}

export const PortalClient: React.FC<PortalClientProps> = ({ session }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const role = session.role;
  const isDirector = role === 'director';

  const handleTabChange = (tab: string) => {
    // Strictly gate tab navigation to authorized department roles only
    if (tab === 'accommodation' && !isDirector && role !== 'hospitality') return;
    if (tab === 'external-stays' && !isDirector && role !== 'hospitality') return;
    if (tab === 'participants' && !isDirector && role !== 'registration') return;
    if (tab === 'duplicates' && !isDirector && role !== 'registration') return;
    if (tab === 'schedule' && !isDirector && role !== 'events') return;
    if (tab === 'logistics' && !isDirector && role !== 'logistics') return;
    if (tab === 'disruptions' && !isDirector) return;

    setCurrentTab(tab);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] text-[#1A1A1A]">
      {/* Role-Gated Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        role={session.role}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Personalized Session Header */}
        <Header
          memberId={session.memberId}
          name={session.name}
          role={session.role}
          shift={session.shift}
          onOpenAuditLogs={() => setIsAuditModalOpen(true)}
          onOpenDisruptions={() => isDirector && setCurrentTab('disruptions')}
        />

        {/* Operational Incident Alert Command System across all 8 dashboards */}
        <OperationalAlertBanner
          currentMemberId={session.memberId}
          currentRole={session.role}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <RoleDashboardView currentRole={session.role} />
            )}

            {currentTab === 'accommodation' && (isDirector || role === 'hospitality') && (
              <AccommodationView />
            )}

            {currentTab === 'external-stays' && (isDirector || role === 'hospitality') && (
              <ExternalStaysView />
            )}

            {currentTab === 'participants' && (isDirector || role === 'registration') && (
              <ParticipantsView />
            )}

            {currentTab === 'duplicates' && (isDirector || role === 'registration') && (
              <FlaggedDuplicatesView />
            )}

            {currentTab === 'schedule' && (isDirector || role === 'events') && (
              <ScheduleClashView />
            )}

            {currentTab === 'logistics' && (isDirector || role === 'logistics') && (
              <LogisticsView />
            )}

            {currentTab === 'disruptions' && isDirector && (
              <DisruptionInjectorView />
            )}
          </div>
        </main>
      </div>

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};