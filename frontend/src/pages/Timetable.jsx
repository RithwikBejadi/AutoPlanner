import React, { useEffect, useState } from 'react';
import { getSchedule, getScheduleByClass, getScheduleByTeacher, getScheduleByRoom, clearSchedule,
         getClassGroups, getTeachers, getRooms, generateSchedule } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Color palette for subjects
const SUBJECT_COLORS = [
  'bg-slate-100 text-slate-900 border border-slate-300',
  'bg-indigo-100 text-indigo-900 border border-indigo-300',
  'bg-cyan-100 text-cyan-900 border border-cyan-300',
  'bg-teal-100 text-teal-900 border border-teal-300',
  'bg-violet-100 text-violet-900 border border-violet-300',
  'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300',
  'bg-emerald-100 text-emerald-900 border border-emerald-300',
  'bg-amber-100 text-amber-900 border border-amber-300',
];

const getSubjectColor = (name) => {
  const code = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return SUBJECT_COLORS[code % SUBJECT_COLORS.length];
};

function ScheduleGrid({ entries }) {
  if (!entries.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center border-dashed">
        <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 64}}>calendar_view_week</span>
        <p className="font-semibold text-on-surface-variant text-lg">Schedule Empty</p>
        <p className="text-sm text-outline mt-2 max-w-sm">No sessions found for the current filter, or the timetable has not been generated yet.</p>
      </div>
    );
  }

  // Get unique timeslots from all entries
  const uniqueTimes = [...new Set(entries.map(e => `${e.timeSlot.startTime}-${e.timeSlot.endTime}`))].sort();

  return (
    <div className="card w-full overflow-x-auto p-0">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/10">
            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest w-32 border-r border-outline-variant/10">Time Slot</th>
            {DAYS.map(day => (
              <th key={day} className="px-6 py-4 text-xs font-bold text-on-surface uppercase tracking-widest min-w-[200px] border-r border-outline-variant/10 last:border-0">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {uniqueTimes.map(timeStr => {
            const [start, end] = timeStr.split('-');
            return (
              <tr key={timeStr} className="hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-6 text-xs font-bold text-on-surface-variant bg-surface-container-low/30 border-r border-outline-variant/10 whitespace-nowrap align-top">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-on-surface">{start}</span>
                    <span className="material-symbols-outlined text-outline opacity-50" style={{fontSize: 16}}>arrow_downward</span>
                    <span>{end}</span>
                  </div>
                </td>
                {DAYS.map(day => {
                  const dayEntries = entries.filter(e => e.timeSlot.day === day && e.timeSlot.startTime === start);
                  return (
                    <td key={day} className="p-3 border-r border-outline-variant/10 last:border-0 align-top">
                      <div className="flex flex-col gap-3">
                        {dayEntries.map(e => (
                          <div key={e.id} className={`p-3 rounded-xl flex flex-col gap-2 shadow-sm animate-fade-in ${getSubjectColor(e.subject.name)}`}>
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-xs uppercase tracking-wider leading-tight">{e.subject.code}</span>
                              <span className="text-[10px] font-semibold bg-white/75 text-on-surface px-1.5 py-0.5 rounded backdrop-blur-sm">{e.room.name}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold font-headline leading-tight mt-1 truncate">{e.subject.name}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="material-symbols-outlined" style={{fontSize: 14}}>person</span>
                                <span className="text-[10px] font-semibold truncate">{e.teacher.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="material-symbols-outlined" style={{fontSize: 14}}>groups</span>
                                <span className="text-[10px] font-semibold truncate">{e.classGroup.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [filterType, setFilterType] = useState('all'); 
  const [classGroups, setClassGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    Promise.all([getClassGroups(), getTeachers(), getRooms()])
      .then(([cg, t, r]) => { setClassGroups(cg); setTeachers(t); setRooms(r); });
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try { setSchedule(await getSchedule()); }
    catch { setError('Failed to load full schedule.'); }
    finally { setLoading(false); }
  };

  const applyFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filterType === 'all' || !selectedId) data = await getSchedule();
      else if (filterType === 'class') data = await getScheduleByClass(selectedId);
      else if (filterType === 'teacher') data = await getScheduleByTeacher(selectedId);
      else if (filterType === 'room') data = await getScheduleByRoom(selectedId);
      setSchedule(data);
    } catch { setError('Failed to apply filter.'); }
    finally { setLoading(false); }
  };

  // Re-run filter when selection changes
  useEffect(() => {
    if (filterType === 'all' || selectedId) {
      applyFilter();
    }
  }, [filterType, selectedId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateSchedule();
      if (filterType === 'all') await loadSchedule();
      else await applyFilter();
    } catch (e) { setError(e.response?.data?.error || 'Generation failed.'); }
    finally { setGenerating(false); }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear the entire schedule?')) return;
    try {
      await clearSchedule();
      setSchedule([]);
    } catch (e) { setError('Failed to clear schedule.'); }
  };

  const filterOptions = {
    class: classGroups,
    teacher: teachers,
    room: rooms,
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="section-title">Master Timetable</h1>
          <p className="section-sub">Interactive grid view of all scheduled instances</p>
        </div>
        
        <div className="flex bg-surface-container rounded-xl p-1.5 border border-outline-variant/10 shadow-sm self-start">
          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all text-secondary hover:bg-secondary/10 disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{fontSize: 18, fontVariationSettings: "'FILL' 1"}}>
              {generating ? 'autorenew' : 'bolt'}
            </span>
            {generating ? 'Running...' : 'Run Engine'}
          </button>
          <div className="w-px bg-outline-variant/20 mx-1.5 my-2" />
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all text-error hover:bg-error/10"
          >
            <span className="material-symbols-outlined" style={{fontSize: 18}}>delete_sweep</span>
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 text-error rounded-2xl px-5 py-4 text-sm">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>error_outline</span>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider mr-2 shrink-0">View By</span>
          {['all', 'class', 'teacher', 'room'].map(t => (
            <button
              key={t}
              onClick={() => { setFilterType(t); setSelectedId(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                filterType === t 
                  ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(196,193,251,0.3)]' 
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest border border-outline-variant/10'
              }`}
            >
              {t === 'all' ? 'Entire Schedule' : t}
            </button>
          ))}
        </div>

        {filterType !== 'all' && (
          <div className="flex-1 w-full md:w-auto flex items-center gap-3 md:pl-4 md:border-l border-outline-variant/10 animate-slide-in">
            <span className="material-symbols-outlined text-outline" style={{fontSize: 18}}>filter_list</span>
            <select 
              value={selectedId} 
              onChange={e => setSelectedId(e.target.value)}
              className="select-dark flex-1 max-w-sm font-medium"
            >
              <option value="">-- Select {filterType.charAt(0).toUpperCase() + filterType.slice(1)} --</option>
              {(filterOptions[filterType] || []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="card h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <span className="material-symbols-outlined animate-spin" style={{fontSize: 32}}>refresh</span>
            <p className="font-semibold text-sm tracking-widest uppercase">Loading Grid</p>
          </div>
        </div>
      ) : (
        <ScheduleGrid entries={schedule} />
      )}
    </div>
  );
}
