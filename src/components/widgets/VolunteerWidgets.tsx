'use client';

import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  Clock,
  CheckSquare,
  AlertCircle,
  QrCode,
  Users,
  Shield,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { RoleKey } from '@/config/roles';

interface WidgetProps {
  role: RoleKey;
  onRefreshTrigger?: () => void;
}

// 1. My Shift Widget
export const MyShiftWidget: React.FC<WidgetProps> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=my_shift&role=${role}`);
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

  const shift = data || {
    member_id: 'ST07',
    name: 'Meera Khan',
    role: 'Volunteer',
    shift: '10:00-18:00',
    phone: '+91-7560219022'
  };

  return (
    <WidgetCard widgetId="my_shift" loading={loading} error={error}>
      <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] space-y-3 text-xs">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-[10px] font-bold text-[#A3703F]">{shift.member_id}</span>
            <p className="font-serif font-bold text-[#1A1A1A] text-base">{shift.name}</p>
            <p className="text-[11px] text-[#6B655E]">{shift.role} Lead</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            On Duty
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EFEBE3] text-[11px]">
          <div>
            <span className="text-[#8F8982] uppercase text-[9px] font-bold">Duty Window</span>
            <p className="font-mono font-bold text-[#1A1A1A] flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-[#A3703F]" /> {shift.shift}
            </p>
          </div>
          <div>
            <span className="text-[#8F8982] uppercase text-[9px] font-bold">Supervisor Contact</span>
            <p className="font-mono text-[#1A1A1A] mt-0.5">{shift.phone}</p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

// 2. My Tasks Widget
export const MyTasksWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/widgets/data?widgetId=my_tasks&role=${role}`);
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

  const handleCompleteTask = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'complete_task',
          taskId,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <WidgetCard
      widgetId="my_tasks"
      loading={loading}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="No pending tasks assigned for this shift window."
    >
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {data.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                isDone ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-[#E5DFD3]'
              }`}
            >
              <div>
                <p className="font-serif font-bold text-[#1A1A1A]">{task.title}</p>
                <p className="text-[10px] text-[#6B655E] font-mono mt-0.5">
                  Venue: {task.venue_name || 'Ground'} | Slot: {task.window_start?.replace('T', ' ').slice(5, 16)}
                </p>
              </div>

              <div>
                {isDone ? (
                  <span className="text-emerald-700 font-mono text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={completingId === task.id}
                    className="px-2.5 py-1 text-xs bg-[#A3703F] text-white rounded hover:bg-[#8C6D36] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {completingId === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark Done'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
};

// 3. Venue Headcount Report Widget
export const VenueHeadcountReportWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [venueId, setVenueId] = useState('V01');
  const [headcount, setHeadcount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(headcount, 10);
    if (isNaN(count) || count < 0) {
      alert('Valid positive attendee headcount is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'report_headcount',
          venueId,
          headcount: count,
          note,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Observed crowd headcount of ${count} recorded for venue ${venueId}.`);
        setHeadcount('');
        setNote('');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WidgetCard widgetId="venue_headcount_report">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Target Venue</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
            >
              <option value="V01">Central Auditorium (V01)</option>
              <option value="V02">Amphitheatre (V02)</option>
              <option value="V03">Sports Arena (V03)</option>
              <option value="V04">Management Block Audi (V04)</option>
              <option value="V05">Seminar Hall A (V05)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Observed Headcount</label>
            <input
              type="number"
              placeholder="e.g. 450"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Ground Crowd Observations</label>
          <input
            type="text"
            placeholder="Balcony full, aisle clear, seating capacity at 80%..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting Headcount...' : 'Submit Observed Headcount'}
        </button>
      </form>
    </WidgetCard>
  );
};

// 4. Report Incident Widget
export const ReportIncidentWidget: React.FC<WidgetProps> = ({ role, onRefreshTrigger }) => {
  const [venueId, setVenueId] = useState('V01');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 5) {
      alert('Mandatory incident description (minimum 5 characters) is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          description: description.trim(),
          severity,
          actorRole: role
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Ground incident reported under ID ${json.incidentId}. Incident Command notified.`);
        setDescription('');
        if (onRefreshTrigger) onRefreshTrigger();
      } else {
        alert(json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WidgetCard widgetId="report_incident">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Incident Venue</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
            >
              <option value="V01">Central Audi (V01)</option>
              <option value="V02">Amphitheatre (V02)</option>
              <option value="V03">Sports Arena (V03)</option>
              <option value="V04">Management Block (V04)</option>
              <option value="V06">Open Grounds (V06)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
            >
              <option value="low">Low (Minor Noise/Spill)</option>
              <option value="medium">Medium (Gear Failure/Crowd)</option>
              <option value="high">High (Medical/Disruption)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#8F8982] mb-1">
            Ground Issue Description (Audit Trail)
          </label>
          <textarea
            placeholder="Describe what occurred, exact location, and actions taken..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD3] bg-[#FAF8F5] text-[#1A1A1A]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-1.5 px-3 rounded bg-[#A3703F] text-white font-medium hover:bg-[#8C6D36] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Dispatching...' : 'Dispatch Incident Alert to Command'}
        </button>
      </form>
    </WidgetCard>
  );
};

// 5. Meal Pass Widget
export const MealPassWidget: React.FC<WidgetProps> = ({ role }) => {
  return (
    <WidgetCard widgetId="meal_pass">
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Duty Shift Clearance Active
          </span>
          <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Official Volunteer Dining Pass</h4>
          <p className="text-xs text-[#6B655E]">
            Valid for Lunch (12:30-15:00) and Dinner (19:30-22:30) at Student Mess & Dining Hall.
          </p>
          <p className="text-[11px] font-mono text-[#8F8982]">Bearer: Meera Khan (ST07) | Lead Volunteer</p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E5DFD3] text-center shadow-sm flex-shrink-0">
          <QrCode className="w-16 h-16 text-[#1A1A1A] mx-auto" />
          <p className="text-[9px] font-mono font-bold text-[#A3703F] mt-1">VOL-ST07-DAY1</p>
        </div>
      </div>
    </WidgetCard>
  );
};

