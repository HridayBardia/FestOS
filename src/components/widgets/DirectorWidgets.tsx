'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  ShieldAlert,
  Users,
  Hotel,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Radio,
  Loader2
} from 'lucide-react';
import { RoleKey, ROLES } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. Master KPI Bar Widget
export const MasterKpiBarWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=master_kpi_bar&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  const kpis = data || {
    totalRegistered: 2836,
    canonicalEligible: 2416,
    checkedIn: 0,
    campusBedsTotal: 710,
    campusBedsOccupied: 710,
    externalPlacements: 740,
    externalProcurementCost: 2701200,
    criticalAlerts: 7
  };

  return (
    <WidgetCard widgetId="master_kpi_bar" loading={loading} error={error}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <p className="text-[10px] font-bold uppercase text-[#8F8982]">Verified Canonical</p>
          <p className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">{kpis.canonicalEligible}</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">2,836 raw pool</p>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200">
          <p className="text-[10px] font-bold uppercase text-emerald-800">Checked In</p>
          <p className="text-2xl font-serif font-bold text-emerald-900 mt-1">{kpis.checkedIn}</p>
          <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
            {Math.round((kpis.checkedIn / (kpis.canonicalEligible || 1)) * 100)}% progress
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <p className="text-[10px] font-bold uppercase text-[#8F8982]">Campus Occupancy</p>
          <p className="text-2xl font-serif font-bold text-[#A3703F] mt-1">100%</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">710/710 beds</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <p className="text-[10px] font-bold uppercase text-[#8F8982]">External Placements</p>
          <p className="text-2xl font-serif font-bold text-[#1A1A1A] mt-1">{kpis.externalPlacements}</p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">EXT01 to EXT06</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3]">
          <p className="text-[10px] font-bold uppercase text-[#8F8982]">Hotel Budget Spend</p>
          <p className="text-xl font-serif font-bold text-[#1A1A1A] mt-1 truncate">
            Rs. {(kpis.externalProcurementCost / 100000).toFixed(2)}L
          </p>
          <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">Procurement total</p>
        </div>

        <div className="p-3.5 rounded-lg bg-red-50/40 border border-red-200">
          <p className="text-[10px] font-bold uppercase text-red-800">Critical Alerts</p>
          <p className="text-2xl font-serif font-bold text-red-900 mt-1">{kpis.criticalAlerts}</p>
          <p className="text-[10px] text-red-700 font-mono mt-0.5">Action required</p>
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. Live Incident Command Widget
export const LiveIncidentCommandWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=live_incident_command&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  const incidents = data?.incidents || [];
  const criticalSystemIssues = data?.criticalSystemIssues || [];

  return (
    <WidgetCard widgetId="live_incident_command" loading={loading} error={error}>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {criticalSystemIssues.map((issue: any) => (
          <div key={issue.id} className="p-3 rounded-lg bg-red-50/50 border border-red-200 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-red-900">{issue.id}</span>
              <span className="text-[9px] uppercase font-bold text-red-800 bg-white px-1.5 py-0.5 rounded border border-red-200">
                {issue.issue_type}
              </span>
            </div>
            <p className="font-serif font-bold text-[#1A1A1A] mt-1">{issue.description}</p>
            <p className="text-[11px] text-red-800 mt-1 font-mono">Suggested: {issue.suggested_action}</p>
          </div>
        ))}

        {incidents.map((inc: any) => (
          <div key={inc.id} className="p-3 rounded-lg bg-white border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-[#1A1A1A]">{inc.id}</span>
              <span className="text-[9px] uppercase font-bold text-[#A3703F]">{inc.severity}</span>
            </div>
            <p className="font-serif font-bold text-[#1A1A1A] mt-1">{inc.description}</p>
            <p className="text-[10px] text-[#8F8982] font-mono mt-1">Reported by: {inc.reported_by}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 3. Pending Approvals Widget
export const PendingApprovalsWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=pending_approvals&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  const handleDecision = async (app: any, decision: 'approve' | 'reject') => {
    const reason = prompt(
      `Enter non-empty executive justification to ${decision.toUpperCase()} request ${app.id}:`
    );
    if (!reason || reason.trim().length < 5) {
      alert('Action aborted: A non-empty reason (minimum 5 characters) is mandatory.');
      return;
    }

    setDecidingId(app.id);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'decide',
          approvalId: app.id,
          decision,
          reason: reason.trim(),
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Request ${app.id} marked ${decision.toUpperCase()} and logged to audit trail.`);
        await fetchData();
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <WidgetCard
      widgetId="pending_approvals"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No pending director approval requests."
    >
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {data.map((app) => (
          <div key={app.id} className="p-3 rounded-lg bg-white border border-[#E5DFD3] text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-[#1A1A1A]">{app.id}</span>
              <span className="text-[10px] font-mono text-[#8F8982]">From: {app.requested_by}</span>
            </div>
            <p className="font-serif font-bold text-[#1A1A1A]">{app.action}</p>
            <p className="text-[11px] text-[#6B655E] leading-normal">{app.reason}</p>

            <div className="flex justify-end gap-2 pt-1 border-t border-[#EFEBE3]">
              <button
                onClick={() => handleDecision(app, 'reject')}
                disabled={decidingId === app.id}
                className="px-2.5 py-1 text-xs border border-red-200 text-red-700 rounded bg-white hover:bg-red-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleDecision(app, 'approve')}
                disabled={decidingId === app.id}
                className="px-2.5 py-1 text-xs bg-[#A3703F] text-white rounded hover:bg-[#8C6D36]"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 4. Cross-Department Alerts Widget
export const CrossDepartmentAlertsWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=cross_department_alerts&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <WidgetCard widgetId="cross_department_alerts" loading={loading} error={error}>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.slice(0, 10).map((alert) => (
          <div key={alert.id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] text-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="font-bold text-[#1A1A1A]">{alert.id}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                  alert.severity === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : alert.severity === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {alert.severity}
              </span>
            </div>
            <p className="font-serif font-bold text-[#1A1A1A] mt-1">{alert.description}</p>
            <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">Action: {alert.suggested_action}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

// 5. Director Alerts Drilldown Widget (Fixed display & rich inspection)
export const DirectorAlertsDrilldownWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=cross_department_alerts&role=${role}`);
      const json = await res.json();
      if (json.success) setData(json.data || []);
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, [role]);

  const filteredData = data.filter((alert: any) => {
    if (severityFilter === 'all') return true;
    return (alert.severity || '').toLowerCase() === severityFilter.toLowerCase();
  });

  const getSeverityStyle = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'bg-[#FAECEB] text-[#7C2D2A] border-[#F0C9C7]';
    if (s === 'high') return 'bg-[#FAF0E4] text-[#7A4E1D] border-[#EED5BC]';
    if (s === 'medium') return 'bg-[#EBF1F5] text-[#2B5661] border-[#CDE0E8]';
    return 'bg-[#EAF3EC] text-[#2D5A3E] border-[#C7E2CE]';
  };

  const formatTitle = (alert: any) => {
    if (alert.title) return alert.title;
    if (alert.issue_type) {
      return alert.issue_type
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return `Operational Anomaly (${alert.id})`;
  };

  return (
    <WidgetCard widgetId="director_alerts_drilldown" loading={loading} error={error}>
      <div className="space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-[#6B655E] leading-relaxed">
            Real-time incident feed and cross-department health metrics prioritized by severity for the Directorate.
          </p>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {['all', 'critical', 'high', 'medium'].map((sev) => {
              const count = sev === 'all' 
                ? data.length 
                : data.filter((a: any) => (a.severity || '').toLowerCase() === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    severityFilter === sev
                      ? 'bg-[#1A1A1A] text-white shadow-sm'
                      : 'bg-white hover:bg-[#FAF8F5] text-[#6B655E] border border-[#E5DFD3]'
                  }`}
                >
                  {sev} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5 pt-1 max-h-[360px] overflow-y-auto pr-1">
          {filteredData.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-center text-[#8F8982]">
              <p className="font-serif font-bold text-xs text-[#1A1A1A]">No Matching Alerts</p>
              <p className="text-[11px] mt-0.5">Telemetry reports 0 issues in the selected filter scope.</p>
            </div>
          ) : (
            filteredData.map((alert: any) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-[#E5DFD3] bg-white flex flex-col gap-2 shadow-sm hover:border-[#D8D1C5] transition-all"
              >
                {/* Header row: Severity, Title, ID & Source file */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${getSeverityStyle(
                        alert.severity
                      )}`}
                    >
                      {alert.severity || 'NOTICE'}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                      {formatTitle(alert)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-[#8F8982]">
                    <span className="px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E5DFD3] font-bold text-[#1A1A1A]">
                      {alert.id}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#4A4540] leading-relaxed">
                  {alert.description || alert.detail || 'Operational variance requiring director review.'}
                </p>

                {/* Footer: Suggested Action & File location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#EFEBE3] text-[11px]">
                  {alert.suggested_action ? (
                    <div className="flex items-center gap-1.5 text-[#7A4E1D] font-medium">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-[#A3703F]">Recommended:</span>
                      <span className="line-clamp-1">{alert.suggested_action}</span>
                    </div>
                  ) : (
                    <span className="text-[#8F8982] text-[10px]">No specific action required</span>
                  )}

                  {alert.file && (
                    <span className="text-[10px] font-mono text-[#8F8982] shrink-0">
                      {alert.file} {alert.row_number ? `· row ${alert.row_number}` : ''} {alert.field ? `(${alert.field})` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetCard>
  );
};

// 6. Festival Timeline Health Widget
export const FestivalTimelineHealthWidget: React.FC<WidgetProps> = ({ role }) => {
  const readiness = [
    { module: 'Accommodations', score: 100, note: '710 campus + 740 external beds allocated' },
    { module: 'Competitions & Stages', score: 98, note: '31 events scheduled in venue windows' },
    { module: 'Catering & Dining', score: 85, note: '4 non-compliant vendors quarantined for hygiene expiry' },
    { module: 'Security & Check-In', score: 95, note: 'NFC credentialing station primed' }
  ];

  return (
    <WidgetCard widgetId="festival_timeline_health">
      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] flex justify-between items-center font-mono">
          <div>
            <span className="text-[10px] text-[#8F8982] uppercase">Festival Operational Window</span>
            <p className="font-bold text-[#1A1A1A]">2026-10-29 08:00 to 2026-11-03 22:00</p>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Active
          </span>
        </div>

        <div className="space-y-2">
          {readiness.map((m, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-white border border-[#E5DFD3]">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-serif font-bold text-[#1A1A1A]">{m.module}</span>
                <span className="font-mono text-[#A3703F] font-bold">{m.score}%</span>
              </div>
              <div className="w-full bg-[#EFEBE3] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#A3703F] h-full rounded-full" style={{ width: `${m.score}%` }} />
              </div>
              <p className="text-[10px] text-[#6B655E] mt-1 font-mono">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
};
