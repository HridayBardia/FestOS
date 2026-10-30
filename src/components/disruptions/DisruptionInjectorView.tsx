'use client';

import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  FileSpreadsheet,
  Building2,
  CalendarDays,
  Users,
  AlertOctagon,
  Sparkles,
  Download,
  UtensilsCrossed,
  Shirt,
  Truck
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { RoleKey, ROLES } from '@/config/roles';

interface DisruptionInjectorViewProps {
  role?: RoleKey;
}

export const DisruptionInjectorView: React.FC<DisruptionInjectorViewProps> = ({ role = 'director' }) => {
  const {
    hostels,
    venues,
    contingents,
    vendors,
    activeDisruptions,
    auditLogs,
    injectDisruption,
    resolveDisruption
  } = useFest();

  const [customReason, setCustomReason] = useState<string>('');
  const [approvingOfficer, setApprovingOfficer] = useState<string>('Operations Directorate');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Sector-tailored operational scenarios (no synthetic judge labels)
  const getSectorScenarios = () => {
    switch (role) {
      case 'hospitality':
        return [
          {
            id: 'hosp-01',
            title: 'IPM Residence 1 Plumbing Mainline Rupture',
            category: 'Hostel Maintenance',
            severity: 'Critical',
            icon: Building2,
            description: 'Major pipeline failure on 2nd floor of IPM-H1. Closes building and initiates immediate overflow relocation to authorized external stays.',
            action: async () => {
              await injectDisruption(
                'HOSTEL_CLOSURE',
                { hostelId: 'hostel-01' },
                'Emergency: Water pipeline rupture in IPM-H1. Immediate safety shutdown ordered by campus engineers.',
                'Hospitality Lead (Ananya Patel)'
              );
              setStatusNotification('IPM Residence 1 successfully shut down for maintenance. Overflow procedures initiated.');
            }
          },
          {
            id: 'hosp-02',
            title: 'Late Flight Arrival: IIM Calcutta Delegation',
            category: 'Contingent Inflow',
            severity: 'High',
            icon: Users,
            description: 'Flight delayed into IDR. Holds reserved rooms and extends late-arrival check-in window without releasing beds.',
            action: async () => {
              await injectDisruption(
                'CONTINGENT_DELAY',
                { contingentId: 'cnt-03' },
                'Flight AI-634 delayed into Indore. Room reservations locked and extended till 02:00 AM.',
                'Hospitality Lead (Ananya Patel)'
              );
              setStatusNotification('IIM Calcutta contingent arrival extended. Beds locked.');
            }
          }
        ];

      case 'events':
        return [
          {
            id: 'evt-01',
            title: 'Chanakya Hall Stage Lighting Transformer Failure',
            category: 'Venue Infrastructure',
            severity: 'Critical',
            icon: CalendarDays,
            description: 'Electrical transformer trip in Chanakya Hall. Relocates flagship competition to Central Auditorium immediately.',
            action: async () => {
              await injectDisruption(
                'VENUE_SHIFT',
                { eventId: 'evt-05', newVenueId: 'ven-01' },
                'Power surge and lighting transformer burnout in Chanakya Hall. Immediate emergency venue relocation authorized.',
                'Events Lead (Arjun Singh)'
              );
              setStatusNotification('Boardroom Blitz relocated to Central Auditorium. Audit trail published.');
            }
          }
        ];

      case 'food':
        return [
          {
            id: 'food-01',
            title: 'Dining Stall 04 Food Safety Audit Hold',
            category: 'Vendor Compliance',
            severity: 'High',
            icon: UtensilsCrossed,
            description: 'FSSAI health inspector flags temperature control non-compliance at Malwa Kitchen. Halts food service pending verification.',
            action: async () => {
              await injectDisruption(
                'VENDOR_BREACH',
                { vendorId: 'vnd-04' },
                'Cold storage temperature non-compliance logged during hygiene audit. Service suspended pending corrective action.',
                'Food Coordinator (Kavya Rao)'
              );
              setStatusNotification('Malwa Kitchen service suspended. Incident logged to central audit trail.');
            }
          }
        ];

      case 'logistics':
        return [
          {
            id: 'log-01',
            title: 'Emergency Sound Console Dispatch to Sports Arena',
            category: 'Audio Logistics',
            severity: 'Medium',
            icon: Truck,
            description: 'Primary mixer failure at badminton pavilion during finals. Reroutes standby AV console from Central Warehouse.',
            action: async () => {
              await injectDisruption(
                'VENDOR_BREACH',
                { vendorId: 'vnd-02' },
                'Sound console mixer channel fault at Sports Arena. Standby unit dispatched under emergency priority.',
                'Logistics Head (Diya Gupta)'
              );
              setStatusNotification('Standby AV sound console dispatched. Venue status updated.');
            }
          }
        ];

      case 'director':
      default:
        return [
          {
            id: 'dir-01',
            title: 'IPM Residence 1 Plumbing Mainline Rupture',
            category: 'Hostel Maintenance',
            severity: 'Critical',
            icon: Building2,
            description: 'Major pipeline failure on 2nd floor of IPM-H1. Closes building and initiates immediate overflow relocation to authorized external stays.',
            action: async () => {
              await injectDisruption(
                'HOSTEL_CLOSURE',
                { hostelId: 'hostel-01' },
                'Emergency: Water pipeline rupture in IPM-H1. Immediate safety shutdown ordered by campus engineers.',
                'Festival Director (Naman Nair)'
              );
              setStatusNotification('IPM-H1 closed. Real-time broadcast pushed to all 48 organizers.');
            }
          },
          {
            id: 'dir-02',
            title: 'Chanakya Hall Electrical Transformer Burnout',
            category: 'Venue Infrastructure',
            severity: 'Critical',
            icon: CalendarDays,
            description: 'Stage lighting blackout. Reallocates flagship Boardroom Blitz to Central Auditorium.',
            action: async () => {
              await injectDisruption(
                'VENUE_SHIFT',
                { eventId: 'evt-05', newVenueId: 'ven-01' },
                'Electrical failure in Chanakya Hall. Shifted to Central Auditorium with live clash audit.',
                'Festival Director (Naman Nair)'
              );
              setStatusNotification('Event venue shifted in real time across the portal.');
            }
          },
          {
            id: 'dir-03',
            title: 'Flight Delay: IIM Calcutta Delegation',
            category: 'Contingent Inflow',
            severity: 'High',
            icon: Users,
            description: 'Flight delayed into IDR. Locks room reservations and auto-updates arrival schedules.',
            action: async () => {
              await injectDisruption(
                'CONTINGENT_DELAY',
                { contingentId: 'cnt-03' },
                'Flight AI-634 delayed into Indore. Room reservations locked and extended till 02:00 AM.',
                'Festival Director (Naman Nair)'
              );
              setStatusNotification('Contingent delay registered and communicated to hospitality.');
            }
          },
          {
            id: 'dir-04',
            title: 'Vendor Health Inspection Breach: Malwa Kitchen',
            category: 'Vendor Compliance',
            severity: 'High',
            icon: UtensilsCrossed,
            description: 'FSSAI hygiene breach in catering zone. Suspends food stall operations pending sanitization.',
            action: async () => {
              await injectDisruption(
                'VENDOR_BREACH',
                { vendorId: 'vnd-04' },
                'FSSAI audit flagged temperature non-compliance in dairy storage. Immediate operational suspension.',
                'Festival Director (Naman Nair)'
              );
              setStatusNotification('Vendor breach registered. Food Coordinator notified.');
            }
          }
        ];
    }
  };

  const scenarios = getSectorScenarios();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF0E4] text-[#7A4E1D] border border-[#EED5BC]">
              Live Operational Stress Testing
            </span>
            <span className="text-xs text-[#8F8982]">Real-Time State Synchronization</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Operations Disruption Console</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Test live incident management workflows. Every change triggers an immutable audit log entry and propagates instantly across all connected organizer screens.
          </p>
        </div>

        {activeDisruptions.length > 0 && (
          <button
            onClick={() => {
              resolveDisruption(activeDisruptions[0]);
              setStatusNotification('Operational anomaly resolved. Facilities restored.');
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2D5A3E] text-xs font-bold border border-[#C7E2CE] shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-[#2D5A3E]" />
            <span>Resolve Active Disruption</span>
          </button>
        )}
      </div>

      {/* Status Toast */}
      {statusNotification && (
        <div className="p-4 rounded-xl bg-[#EAF3EC] border border-[#C7E2CE] text-[#2D5A3E] text-xs font-medium flex items-center justify-between animate-fade-in shadow-sm">
          <span>{statusNotification}</span>
          <button onClick={() => setStatusNotification(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          return (
            <div
              key={scen.id}
              className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-luxury flex flex-col justify-between space-y-4 hover:border-[#A3703F]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                    {scen.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C2D2A] bg-[#FAECEB] px-2 py-0.5 rounded border border-[#F0C9C7]">
                    {scen.severity}
                  </span>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-[#A3703F] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">{scen.title}</h4>
                    <p className="text-xs text-[#6B655E] mt-1 leading-relaxed">{scen.description}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={scen.action}
                className="w-full py-2.5 px-4 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Trigger Incident Live</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
