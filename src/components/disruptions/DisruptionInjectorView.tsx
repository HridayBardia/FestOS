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
  Download
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { formatISTTimeWithSeconds } from '@/lib/formatters';

export const DisruptionInjectorView: React.FC = () => {
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

  const [customType, setCustomType] = useState<'HOSTEL_CLOSURE' | 'VENUE_SHIFT' | 'CONTINGENT_DELAY' | 'VENDOR_BREACH'>('HOSTEL_CLOSURE');
  const [targetId, setTargetId] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [judgeName, setJudgeName] = useState<string>('Evaluation Judge (Jury Panel)');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const PRESET_SCENARIOS = [
    {
      id: 'scen-01',
      title: 'Hostel Closure: IPM-H1 Pipeline Rupture',
      category: 'Infrastructure',
      severity: 'Critical',
      icon: Building2,
      description: 'Simulates complete plumbing burst in IPM Residence 1. Closes building, flags 74 female delegates as displaced, and activates overflow stays.',
      action: async () => {
        await injectDisruption(
          'HOSTEL_CLOSURE',
          { hostelId: 'hostel-01' },
          'Emergency: Main water mainline burst on 2nd floor of IPM-H1. Immediate safety shutdown ordered by campus engineers.',
          'Chief Warden & Fest Directorate'
        );
        showFeedback('Hostel IPM-H1 CLOSED. Displaced delegates queued for reallocation.');
      },
    },
    {
      id: 'scen-02',
      title: 'Weather Disruption: Amphitheatre Flooded',
      category: 'Events & Venues',
      severity: 'High',
      icon: CalendarDays,
      description: 'Unseasonal torrential storm renders open-air Amphitheatre unusable. Shifts Ritviz Pro-Night into Central Audi, sparking real-time clash calculations.',
      action: async () => {
        await injectDisruption(
          'VENUE_SHIFT',
          { eventId: 'evt-05', newVenueId: 'ven-01' },
          'Sudden severe thunderstorm with 60km/h gusts over Indore. Amphitheatre evacuated; Pro-Night shifted indoors.',
          'Stage Operations Command'
        );
        showFeedback('Ritviz Pro-Night shifted to Central Audi. Clash matrix recalculated.');
      },
    },
    {
      id: 'scen-03',
      title: 'Logistics Delay: FMS Delhi Flight Stranded',
      category: 'Delegations',
      severity: 'Medium',
      icon: Users,
      description: 'Flight UK-942 delayed by fog in Delhi. Holds contingent room reservations against auto-cancellation.',
      action: async () => {
        await injectDisruption(
          'CONTINGENT_DELAY',
          { contingentId: 'cnt-05' },
          'IndiGo 6E-2104 delayed due to runway visibility in Delhi. Midnight arrival protocol activated.',
          'Travel Desk Coordinator'
        );
        showFeedback('FMS Delhi marked Delayed. Room reservations locked.');
      },
    },
    {
      id: 'scen-04',
      title: 'Food Safety Alert: Catering Hygiene Breach',
      category: 'Vendors',
      severity: 'Critical',
      icon: AlertOctagon,
      description: 'Food safety inspector flags expired ingredient consignment. Marks vendor as breached and summons emergency health team.',
      action: async () => {
        await injectDisruption(
          'VENDOR_BREACH',
          { vendorId: 'vnd-05' },
          'Sanitary health audit found expired microbial clearance certificates. Service license halted pending re-inspection.',
          'Campus Health Officer'
        );
        showFeedback('Vendor marked BREACHED. Emergency medical notice logged.');
      },
    },
  ];

  const showFeedback = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleCustomInject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim()) {
      alert('A valid operational justification is mandatory for audit logging.');
      return;
    }

    if (customType === 'HOSTEL_CLOSURE') {
      await injectDisruption('HOSTEL_CLOSURE', { hostelId: targetId || hostels[0].id }, customReason, judgeName);
    } else if (customType === 'VENUE_SHIFT') {
      await injectDisruption('VENUE_SHIFT', { eventId: 'evt-01', newVenueId: targetId || venues[0].id }, customReason, judgeName);
    } else if (customType === 'CONTINGENT_DELAY') {
      await injectDisruption('CONTINGENT_DELAY', { contingentId: targetId || contingents[0].id }, customReason, judgeName);
    } else if (customType === 'VENDOR_BREACH') {
      await injectDisruption('VENDOR_BREACH', { vendorId: targetId || vendors[0].id }, customReason, judgeName);
    }

    showFeedback(`Custom disruption "${customType}" injected and logged!`);
    setCustomReason('');
  };

  const handleExportAuditLogs = () => {
    const headers = ['Timestamp', 'Actor', 'Action Type', 'Entity ID', 'Entity Type', 'Reason', 'Previous State', 'New State', 'Approved By'];
    const rows = auditLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.actor}"`,
      `"${log.action_type}"`,
      `"${log.entity_id}"`,
      `"${log.entity_type}"`,
      `"${log.reason.replace(/"/g, '""')}"`,
      `"${log.previous_state}"`,
      `"${log.new_state}"`,
      `"${log.approved_by}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarohan_2026_Overrides_Audit_Log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
              Jury Testing Harness
            </span>
            <span className="text-xs text-[#8F8982]">Live State Mutation & Immutable Audit</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Live Disruption Injector & Audit Engine</h2>
          <p className="text-xs text-[#6B655E] mt-0.5">
            Test the resilience and real-time responsiveness of FestOS by injecting simulated operational crises.
          </p>
        </div>

        {activeDisruptions.length > 0 && (
          <button
            onClick={() => {
              activeDisruptions.forEach((id) => resolveDisruption(id));
              showFeedback('All simulated disruptions resolved and campus facilities restored.');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#2D5A3E] hover:bg-[#234731] text-white text-xs font-bold shadow-md shadow-[#2D5A3E]/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset & Restore All Facilities</span>
          </button>
        )}
      </div>

      {/* Status Feedback Notification */}
      {statusNotification && (
        <div className="bg-[#FAF0E4] border border-[#EED5BC] p-4 rounded-2xl text-[#7A4E1D] text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#A3703F]" />
            <span>{statusNotification}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-[#EED5BC]">
            Committed to Supabase
          </span>
        </div>
      )}

      {/* Preset Test Scenarios Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#A3703F]" />
            <span>Pre-Configured Hackathon Evaluation Scenarios (1-Click Jury Tests)</span>
          </h3>
          <span className="text-[11px] text-[#8F8982] font-mono">Real-time WebSocket Broadcast</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SCENARIOS.map((scen) => {
            const Icon = scen.icon;
            return (
              <div
                key={scen.id}
                className="bg-white border border-[#E5DFD3] hover:border-[#A3703F] rounded-2xl p-5 shadow-luxury transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]">
                      {scen.category}
                    </span>
                    <span className="text-[#7A4E1D] text-[10px] font-bold uppercase">
                      {scen.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 my-2.5">
                    <div className="p-2.5 rounded-xl bg-[#F6EFE6] text-[#A3703F] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-bold text-[#1A1A1A] text-sm leading-snug">{scen.title}</h4>
                  </div>

                  <p className="text-xs text-[#6B655E] leading-relaxed mt-2">{scen.description}</p>
                </div>

                <button
                  onClick={scen.action}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Inject Test Live</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Disruption Builder */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-luxury">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-base mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#A3703F]" />
          <span>Custom Disruption Constructor</span>
        </h3>
        <p className="text-xs text-[#6B655E] mb-4">
          Construct an arbitrary operational test to evaluate constraint solvers, real-time sync, and immutable logging.
        </p>

        <form onSubmit={handleCustomInject} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">Disruption Action</label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
            >
              <option value="HOSTEL_CLOSURE">Close Hostel Building</option>
              <option value="VENUE_SHIFT">Shift Event Venue</option>
              <option value="CONTINGENT_DELAY">Delay Contingent Arrival</option>
              <option value="VENDOR_BREACH">Flag Vendor Breach</option>
            </select>
          </div>

          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">Target Entity</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
            >
              {customType === 'HOSTEL_CLOSURE' &&
                hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.gender_allowed})
                  </option>
                ))}
              {customType === 'VENUE_SHIFT' &&
                venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              {customType === 'CONTINGENT_DELAY' &&
                contingents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              {customType === 'VENDOR_BREACH' &&
                vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">Mandatory Justification *</label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Electrical transformer trip at Chanakya Hall"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E5DFD3] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#A3703F]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] text-white text-xs font-bold shadow-md shadow-[#A3703F]/20 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Broadcast Disruption</span>
            </button>
          </div>
        </form>
      </div>

      {/* Overrides Audit Log Table */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-luxury">
        <div className="p-5 border-b border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F6EFE6] text-[#A3703F]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                `overrides_audit_log` PostgreSQL Table Explorer
              </h3>
              <p className="text-xs text-[#6B655E]">
                Every single policy override, room vacate, and venue shift is written to Supabase with mandatory reason.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportAuditLogs}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] text-xs font-bold border border-[#E5DFD3] shadow-sm flex items-center gap-2 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#A3703F]" />
            <span>Export Audit CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#8F8982] border-b border-[#E5DFD3]">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity Ref</th>
                <th className="py-3 px-4">Mandatory Justification</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEBE3] font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 text-[#8F8982] whitespace-nowrap" suppressHydrationWarning>
                    {formatISTTimeWithSeconds(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F6EFE6] text-[#A3703F] border border-[#E5DFD3]">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#1A1A1A] font-bold">{log.entity_id}</td>
                  <td className="py-3 px-4 font-sans text-xs text-[#1A1A1A] max-w-sm">
                    {log.reason}
                  </td>
                  <td className="py-3 px-4 text-[10px]">
                    <span className="text-[#8F8982]">{log.previous_state}</span>
                    <span className="mx-1 text-[#8F8982]">&rarr;</span>
                    <span className="text-[#2D5A3E] font-bold">{log.new_state}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-[#6B655E] font-medium">
                    {log.approved_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
