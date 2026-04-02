import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeachers, getRooms, getSubjects, getClassGroups, getTimeslots, getSchedule, generateSchedule } from '../api';

const statCards = [
  { key: 'teachers', label: 'Teachers', icon: 'school', to: '/teachers', color: 'from-primary to-primary-dim' },
  { key: 'rooms', label: 'Rooms', icon: 'meeting_room', to: '/rooms', color: 'from-secondary to-cyan-400' },
  { key: 'subjects', label: 'Subjects', icon: 'menu_book', to: '/subjects', color: 'from-tertiary to-violet-400' },
  { key: 'classGroups', label: 'Class Groups', icon: 'groups', to: '/class-groups', color: 'from-primary to-indigo-400' },
  { key: 'timeslots', label: 'Time Slots', icon: 'schedule', to: '/timeslots', color: 'from-secondary to-teal-400' },
  { key: 'scheduleEntries', label: 'Scheduled Sessions', icon: 'calendar_view_week', to: '/timetable', color: 'from-tertiary to-purple-400' },
];

function StatCard({ label, value, icon, to, color, loading }) {
  return (
    <Link
      to={to}
      className="card card-hover group relative overflow-hidden cursor-pointer"
    >
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="flex items-start justify-between mb-4">
        <span className={`material-symbols-outlined bg-gradient-to-br ${color} bg-clip-text text-transparent`} style={{fontSize: 22, fontVariationSettings: "'FILL' 1"}}>
          {icon}
        </span>
        <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity" style={{fontSize: 14}}>arrow_outward</span>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-surface-container-high rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="stat-number">{value}</p>
        )}
        <p className="label-tiny mt-1">{label}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ teachers: 0, rooms: 0, subjects: 0, classGroups: 0, timeslots: 0, scheduleEntries: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [teachers, rooms, subjects, classGroups, timeslots, schedule] = await Promise.all([
        getTeachers(), getRooms(), getSubjects(), getClassGroups(), getTimeslots(), getSchedule(),
      ]);
      setStats({
        teachers: teachers.length,
        rooms: rooms.length,
        subjects: subjects.length,
        classGroups: classGroups.length,
        timeslots: timeslots.length,
        scheduleEntries: schedule.length,
      });
    } catch {
      setError('Failed to load stats. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    try {
      const res = await generateSchedule();
      setResult(res);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="section-title">Command Center</h1>
        <p className="section-sub">Institutional planning dashboard — all scheduling entities at a glance.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 text-error rounded-2xl px-5 py-4 text-sm">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>error_outline</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ key, ...cardProps }) => (
          <StatCard key={key} {...cardProps} value={stats[key]} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Optimizer Engine</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">Run the constraint-based scheduler — existing schedule will be replaced.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_6px_#4cd7f6]" />
              <span className="text-xs font-semibold text-secondary">AI Ready</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            id="generate-timetable-btn"
            className="btn-primary flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <span className="material-symbols-outlined" style={{fontSize: 18, fontVariationSettings: "'FILL' 1"}}>
              {generating ? 'pending' : 'auto_awesome'}
            </span>
            {generating ? 'Generating Schedule...' : 'Generate Timetable'}
          </button>

          {result && (
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-secondary font-semibold text-sm">
                <span className="material-symbols-outlined" style={{fontSize: 16, fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                {result.message}
              </div>
              <div className="flex gap-6 text-xs text-on-surface-variant">
                <span>Assigned: <strong className="text-on-surface">{result.totalAssigned}</strong></span>
                <span>Unassigned: <strong className={result.totalUnassigned > 0 ? 'text-error' : 'text-on-surface'}>{result.totalUnassigned}</strong></span>
              </div>
              {result.unassigned?.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {result.unassigned.map((u, i) => (
                    <li key={i} className="text-xs text-error/80 flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{fontSize: 12}}>warning</span>
                      {u.classGroup} — {u.subject}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="card space-y-5">
          <h2 className="font-headline font-bold text-lg text-on-surface">System Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Room Utilization', pct: stats.scheduleEntries && stats.timeslots && stats.rooms ? Math.min(100, Math.round((stats.scheduleEntries / (stats.timeslots * stats.rooms)) * 100)) : 0, color: 'bg-secondary' },
              { label: 'Teacher Coverage', pct: stats.teachers > 0 ? Math.min(100, Math.round((stats.subjects / stats.teachers) * 20)) : 0, color: 'bg-primary' },
              { label: 'Schedule Density', pct: stats.timeslots > 0 ? Math.min(100, Math.round((stats.scheduleEntries / (stats.timeslots * Math.max(1, stats.classGroups))) * 100)) : 0, color: 'bg-tertiary' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-on-surface-variant">{label}</span>
                  <span className="text-xs font-bold text-on-surface">{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{width: `${pct}%`}} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-3">
            {[
              { label: 'Data Entities', value: stats.teachers + stats.rooms + stats.subjects + stats.classGroups },
              { label: 'Weekly Slots', value: stats.timeslots },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-container-high rounded-xl p-3">
                <p className="label-tiny mb-1">{label}</p>
                <p className="text-lg font-headline font-bold text-on-surface">{loading ? '—' : value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline font-bold text-lg text-on-surface">Quick Navigation</h2>
          <span className="label-tiny">Admin Portals</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ key, label, icon, to, color }) => (
            <Link key={key} to={to} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-surface-container-high hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all group">
              <span className={`material-symbols-outlined bg-gradient-to-br ${color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`} style={{fontSize: 22, fontVariationSettings: "'FILL' 1"}}>
                {icon}
              </span>
              <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
