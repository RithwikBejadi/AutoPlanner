import React, { useEffect, useState } from 'react';
import { getSchedule, getScheduleByClass, getScheduleByTeacher, getScheduleByRoom, clearSchedule,
         getClassGroups, getTeachers, getRooms, generateSchedule } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function ScheduleTable({ entries }) {
  if (!entries.length) {
    return <p className="text-gray-400 text-center py-12">No schedule entries found. Generate a timetable first.</p>;
  }

  const byDay = DAYS.map(day => ({
    day,
    entries: entries
      .filter(e => e.timeSlot.day === day)
      .sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)),
  }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="px-4 py-3 text-left">Day</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Subject</th>
            <th className="px-4 py-3 text-left">Teacher</th>
            <th className="px-4 py-3 text-left">Room</th>
            <th className="px-4 py-3 text-left">Class Group</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {byDay.map(({ day, entries }) =>
            entries.map((e, i) => (
              <tr key={e.id} className="hover:bg-gray-50">
                {i === 0 && (
                  <td className="px-4 py-3 font-semibold text-blue-700 align-top" rowSpan={entries.length}>{day}</td>
                )}
                <td className="px-4 py-3 text-gray-500">{e.timeSlot.startTime} – {e.timeSlot.endTime}</td>
                <td className="px-4 py-3 font-medium">{e.subject.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.teacher.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.room.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.classGroup.name}</td>
              </tr>
            ))
          )}
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

  
  const [filter, setFilter] = useState('all'); 
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
    catch { setError('Failed to load schedule.'); }
    finally { setLoading(false); }
  };

  const applyFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filter === 'all' || !selectedId) data = await getSchedule();
      else if (filter === 'class') data = await getScheduleByClass(selectedId);
      else if (filter === 'teacher') data = await getScheduleByTeacher(selectedId);
      else if (filter === 'room') data = await getScheduleByRoom(selectedId);
      setSchedule(data);
    } catch { setError('Failed to apply filter.'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateSchedule();
      await loadSchedule();
    } catch (e) { setError(e.response?.data?.error || 'Generation failed.'); }
    finally { setGenerating(false); }
  };

  const handleClear = async () => {
    if (!confirm('Clear the entire schedule?')) return;
    await clearSchedule();
    setSchedule([]);
  };

  const filterOptions = {
    class: classGroups,
    teacher: teachers,
    room: rooms,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold">Timetable</h1>
        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={generating}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-4 py-2 rounded font-medium text-sm">
            {generating ? 'Generating...' : 'Generate'}
          </button>
          <button onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm">
            Clear
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      {}
      <div className="bg-white shadow rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter by</label>
          <select value={filter} onChange={e => { setFilter(e.target.value); setSelectedId(''); }}
            className="border rounded px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="class">Class Group</option>
            <option value="teacher">Teacher</option>
            <option value="room">Room</option>
          </select>
        </div>
        {filter !== 'all' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Select</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="border rounded px-3 py-2 text-sm min-w-44">
              <option value="">-- choose --</option>
              {(filterOptions[filter] || []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        )}
        <button onClick={applyFilter} className="bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800">
          Apply
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? <p className="text-gray-400 text-center py-12">Loading...</p> : <ScheduleTable entries={schedule} />}
      </div>
    </div>
  );
}
