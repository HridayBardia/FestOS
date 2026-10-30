'use client';

// FestOS Portal Client Shell
// Interactive role dashboard and deep view tab container
// Zero em dashes or en dashes in any UI copy or code

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleDashboardView } from '@/components/dashboard/RoleDashboardView';
import { AccommodationView } from '@/components/accommodation/AccommodationView';
import { ParticipantsView } from '@/components/participants/ParticipantsView';
import { ScheduleClashView } from '@/components/schedule/ScheduleClashView';
import { LogisticsView } from '@/components/logistics/LogisticsView';
import { DisruptionInjectorView } from '@/components/disruptions/DisruptionInjectorView';
import { AuditLogModal } from '@/components/audit/AuditLogModal';
import { RoleKey, PERMISSION_MATRIX } from '@/config/roles';
import { SessionPayload } from '@/lib/jwt';

interface PortalClientProps {
  session: SessionPayload;
}

export const PortalClient: React.FC<PortalClientProps> = ({ session }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isDisruptionsModalOpen, setIsDisruptionsModalOpen] = useState<boolean>(false);

  const permissions = PERMISSION_MATRIX[session.role] || PERMISSION_MATRIX.director;

  const handleTabChange = (tab: string) => {
    // Validate tab access against permission matrix
    if (tab === 'accommodation' && permissions.accommodation === 'none') return;
    if (tab === 'participants' && permissions.participants === 'none') return;
    if (tab === 'schedule' && permissions.schedule === 'none') return;
    if (
      tab === 'logistics' &&
      permissions.logistics === 'none' &&
      permissions.vendors === 'none'
    )
      return;
    if (tab === 'disruptions' && !permissions.disruptions) return;

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
          onOpenDisruptions={() => setCurrentTab('disruptions')}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <RoleDashboardView currentRole={session.role} />
            )}

            {currentTab === 'accommodation' && permissions.accommodation !== 'none' && (
              <AccommodationView />
            )}

            {currentTab === 'participants' && permissions.participants !== 'none' && (
              <ParticipantsView />
            )}

            {currentTab === 'schedule' && permissions.schedule !== 'none' && (
              <ScheduleClashView />
            )}

            {currentTab === 'logistics' &&
              (permissions.logistics !== 'none' || permissions.vendors !== 'none') && (
                <LogisticsView />
              )}

            {currentTab === 'disruptions' && (
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
