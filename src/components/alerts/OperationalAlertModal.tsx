'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  CheckCheck,
  Flame,
  Volume2
} from 'lucide-react';
import { useFest } from '@/context/FestContext';
import { OperationalAlert } from '@/types/database';
import { formatISTTime } from '@/lib/formatters';

interface OperationalAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'feed' | 'broadcast';
  currentMemberId?: string;
  currentMemberRole?: string;
}

export const OperationalAlertModal: React.FC<OperationalAlertModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'feed',
  currentMemberId = 'ST08',
  currentMemberRole = 'director'
}) => {
  const {
    operationalAlerts,
    broadcastOperationalAlert,
    acknowledgeOperationalAlert,
    resolveOperationalAlert,
    events,
    venues
  } = useFest();

  const [activeTab, setActiveTab] = useState<'feed' | 'broadcast' | 'resolved'>(initialTab);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');

  // Broadcast Form State
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'critical' | 'high' | 'medium' | 'info'>('high');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [operationalImpact, setOperationalImpact] = useState<string>('');
  const [requiredAction, setRequiredAction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeAlerts = operationalAlerts.filter((a) => a.status !== 'resolved');
  const resolvedAlerts = operationalAlerts.filter((a) => a.status === 'resolved');

  const filteredActiveAlerts = activeAlerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !problemDescription.trim() || !requiredAction.trim()) {
      alert('Please fill out all mandatory operational alert fields.');
      return;
    }

    setIsSubmitting(true);
    const chosenEvent = events.find((ev) => ev.id === selectedEventId);
    const chosenVenue = venues.find((vn) => vn.id === selectedVenueId);

    broadcastOperationalAlert({
      severity: broadcastSeverity,
      eventId: selectedEventId || undefined,
      eventName: chosenEvent?.title || undefined,
      venueId: selectedVenueId || undefined,
      venueName: chosenVenue?.name || undefined,
      title: alertTitle.trim(),
      problemDescription: problemDescription.trim(),
      operationalImpact: operationalImpact.trim() || 'Potential delay or disruption to festival schedule.',
      requiredAction: requiredAction.trim(),
      reportedBy: `${currentMemberRole.toUpperCase()} Command (${currentMemberId})`,
      reportedRole: currentMemberRole
    });

    setIsSubmitting(false);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setActiveTab('feed');
      // Reset form
      setAlertTitle('');
      setProblemDescription('');
      setOperationalImpact('');
      setRequiredAction('');
      setSelectedEventId('');
      setSelectedVenueId('');
    }, 1200);
  };

  const handleExecuteResolve = (alertId: string) => {
    if (!resolutionText.trim()) {
      alert('Mandatory resolution log note is required.');
      return;
    }
    resolveOperationalAlert(alertId, resolutionText.trim());
    setResolvingId(null);
    setResolutionText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E5DFD3] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-red-700">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  FestOS Operational Incident Command
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-50 text-red-800 border border-red-200">
                  ALL 8 DESKS SYNCHRONIZED
                </span>
              </div>
              <p className="text-xs text-[#6B655E] mt-0.5">
                Real-time operational problem dispatch broadcasting to all coordinators during festival events.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8F8982] hover:text-[#1A1A1A] hover:bg-[#EFEBE3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-[#E5DFD3] bg-[#FAF8F5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'feed'
                  ? 'border-red-600 text-red-700 bg-white'
                  : 'border-transparent text-[#6B655E] hover:text-[#1A1A1A]'
              }`}
            >
              Active Incidents ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'broadcast'
                  ? 'border-red-600 text-red-700 bg-white'
                  : 'border-transparent text-[#6B655E] hover:text-[#1A1A1A]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast New Incident</span>
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'resolved'
                  ? 'border-red-600 text-red-700 bg-white'
                  : 'border-transparent text-[#6B655E] hover:text-[#1A1A1A]'
              }`}
            >
              Resolved History ({resolvedAlerts.length})
            </button>
          </div>

          {activeTab === 'feed' && (
            <div className="flex items-center gap-1.5 pb-2 text-[11px]">
              <span className="text-[#8F8982] font-semibold uppercase text-[10px]">Filter:</span>
              {['all', 'critical', 'high', 'medium'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded capitalize font-medium transition-all ${
                    severityFilter === sev
                      ? 'bg-red-700 text-white font-bold'
                      : 'bg-white text-[#6B655E] border border-[#E5DFD3] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#FAF8F5]/50 space-y-4">
          {/* TAB 1: ACTIVE INCIDENTS FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-3">
              {filteredActiveAlerts.length === 0 ? (
                <div className="p-10 text-center rounded-xl bg-white border border-[#E5DFD3]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-serif font-bold text-[#1A1A1A]">No Active Critical Incidents</p>
                  <p className="text-xs text-[#6B655E] mt-0.5">
                    All festival venues and events are currently operating normally without blocking alerts.
                  </p>
                </div>
              ) : (
                filteredActiveAlerts.map((alert) => {
                  const isCritical = alert.severity === 'critical';
                  const isHigh = alert.severity === 'high';
                  const isAcknowledged = alert.acknowledgedBy.includes(currentMemberId);

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border bg-white shadow-xs space-y-3 transition-all ${
                        isCritical
                          ? 'border-red-300 ring-1 ring-red-200'
                          : isHigh
                          ? 'border-amber-300'
                          : 'border-[#E5DFD3]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4F1EA] pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isCritical
                              ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                              : isHigh
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-[#A3703F] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD3]">
                            {alert.alertCode}
                          </span>
                          {alert.eventName && (
                            <span className="px-2 py-0.5 rounded bg-[#F6EFE6] text-[#A3703F] font-bold text-xs border border-[#E5DFD3]">
                              Event: {alert.eventName} ({alert.eventId})
                            </span>
                          )}
                          {alert.venueName && (
                            <span className="flex items-center gap-1 text-xs text-[#6B655E]">
                              <MapPin className="w-3.5 h-3.5 text-[#A3703F]" />
                              {alert.venueName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#8F8982] font-mono">
                          <Clock className="w-3 h-3 text-[#A3703F]" />
                          <span>{formatISTTime(alert.timestamp)} IST</span>
                        </div>
                      </div>

                      {/* Alert Title & Problem Statement */}
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#1A1A1A] leading-snug">
                          {alert.title}
                        </h4>
                        <div className="mt-2 p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] text-xs text-[#1A1A1A] space-y-1.5">
                          <div className="flex items-start gap-1.5">
                            <span className="font-bold text-[#7C2D2A] shrink-0">Problem:</span>
                            <p className="text-[#333] leading-relaxed">{alert.problemDescription}</p>
                          </div>
                          <div className="flex items-start gap-1.5 pt-1 border-t border-[#EFEBE3]">
                            <span className="font-bold text-[#A3703F] shrink-0">Operational Impact:</span>
                            <p className="text-[#555]">{alert.operationalImpact}</p>
                          </div>
                          <div className="flex items-start gap-1.5 pt-1 border-t border-[#EFEBE3]">
                            <span className="font-bold text-emerald-800 shrink-0">Action Required:</span>
                            <p className="font-semibold text-emerald-950">{alert.requiredAction}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer & Acknowledgment Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-[#8F8982]">
                          <span>Reported by: <strong className="text-[#1A1A1A]">{alert.reportedBy}</strong></span>
                          <span>|</span>
                          <span>Acks: {alert.acknowledgedBy.length > 0 ? alert.acknowledgedBy.join(', ') : 'None yet'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isAcknowledged && (
                            <button
                              onClick={() => acknowledgeOperationalAlert(alert.id, currentMemberId)}
                              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-white text-[#1A1A1A] border border-[#E5DFD3] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-[#2D5A3E]" />
                              <span>Acknowledge</span>
                            </button>
                          )}

                          {resolvingId === alert.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Resolution action taken..."
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded border border-[#E5DFD3] bg-white text-[#1A1A1A] w-48"
                              />
                              <button
                                onClick={() => handleExecuteResolve(alert.id)}
                                className="px-2.5 py-1 rounded bg-emerald-700 text-white font-bold text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setResolvingId(null)}
                                className="text-xs text-[#8F8982] hover:text-[#1A1A1A]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingId(alert.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Mark Resolved</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: BROADCAST NEW INCIDENT FORM */}
          {activeTab === 'broadcast' && (
            <div className="bg-white border border-[#E5DFD3] rounded-xl p-5 shadow-xs">
              <div className="mb-4">
                <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                  Dispatch Operational Alert to All 8 Department Desks
                </h4>
                <p className="text-xs text-[#6B655E] mt-0.5">
                  Broadcasts immediately to all coordinators, desk supervisors, and the festival director.
                </p>
              </div>

              {broadcastSuccess ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-serif font-bold text-emerald-900 text-lg">Operational Alert Broadcast Dispatched</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    All 8 role dashboards have been notified with high priority.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                        Severity Level *
                      </label>
                      <select
                        value={broadcastSeverity}
                        onChange={(e: any) => setBroadcastSeverity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-semibold"
                      >
                        <option value="critical">CRITICAL (Immediate Action Required)</option>
                        <option value="high">HIGH (Schedule / Safety Risk)</option>
                        <option value="medium">MEDIUM (Operational Friction)</option>
                        <option value="info">INFO (General Advisory)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                        Target Event (Optional)
                      </label>
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
                      >
                        <option value="">Select event (or campus-wide)...</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({ev.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                        Target Venue (Optional)
                      </label>
                      <select
                        value={selectedVenueId}
                        onChange={(e) => setSelectedVenueId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
                      >
                        <option value="">Select venue location...</option>
                        {venues.map((vn) => (
                          <option key={vn.id} value={vn.id}>
                            {vn.name} ({vn.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                      Incident Title (Headline) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amphitheatre PA Line Shortage during Case Clash"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                      Exact Problem Statement (What happened during or for the event) *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Provide precise operational issue details: equipment failure, delay, safety factor, vendor issue..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                        Operational Impact (Cascade Risk)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 minute delay risk to next scheduled debate slot"
                        value={operationalImpact}
                        onChange={(e) => setOperationalImpact(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
                        Specific Action Directed to Co-Members *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Logistics dispatch backup mic to Amphitheatre immediately"
                        value={requiredAction}
                        onChange={(e) => setRequiredAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-[#F4F1EA]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('feed')}
                      className="px-4 py-2 rounded-xl text-xs text-[#6B655E] hover:text-[#1A1A1A] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-700/20 flex items-center gap-2 transition-all"
                    >
                      <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>{isSubmitting ? 'Transmitting Broadcast...' : 'Broadcast to All Desks Now'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: RESOLVED INCIDENTS */}
          {activeTab === 'resolved' && (
            <div className="space-y-3">
              {resolvedAlerts.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E5DFD3] rounded-xl text-xs text-[#8F8982]">
                  No resolved incidents in current session history.
                </div>
              ) : (
                resolvedAlerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                          RESOLVED
                        </span>
                        <span className="font-serif font-bold text-[#1A1A1A]">{alert.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8F8982]">
                        {alert.resolvedAt ? formatISTTime(alert.resolvedAt) : 'Resolved'} IST
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B655E]">{alert.problemDescription}</p>
                    <div className="text-[11px] text-emerald-900 bg-white p-2 rounded border border-emerald-200">
                      <strong>Resolution:</strong> {alert.resolutionNote || 'Addressed by operations command.'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
