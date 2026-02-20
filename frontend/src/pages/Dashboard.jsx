import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeachers, getRooms, getSubjects, getClassGroups, getTimeslots, getSchedule, generateSchedule } from '../api';

function StatCard({ label, value, to }) {
  return (
    <Link to={to} className="bg-white rounded-xl shadow p-6 flex flex-col gap-1 hover:shadow-md transition-shadow">
      <span className="text-3xl font-bold text-blue-700">{value}</span>
      <span className="text-gray-500 text-sm">{label}</span>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all scheduling entities and timetable generation.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Teachers" value={stats.teachers} to="/teachers" />
          <StatCard label="Rooms" value={stats.rooms} to="/rooms" />
          <StatCard label="Subjects" value={stats.subjects} to="/subjects" />
          <StatCard label="Class Groups" value={stats.classGroups} to="/class-groups" />
          <StatCard label="Time Slots" value={stats.timeslots} to="/timeslots" />
          <StatCard label="Schedule Entries" value={stats.scheduleEntries} to="/timetable" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Generate Timetable</h2>
        <p className="text-gray-500 text-sm">
          Runs the constraint-based scheduler and populates the timetable. Any existing schedule will be replaced.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          {generating ? 'Generating...' : 'Generate Timetable'}
        </button>

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm space-y-1">
            <p className="font-medium">{result.message}</p>
            <p>Assigned: {result.totalAssigned} | Unassigned: {result.totalUnassigned}</p>
            {result.unassigned?.length > 0 && (
              <ul className="list-disc list-inside text-green-700">
                {result.unassigned.map((u, i) => <li key={i}>{u.classGroup} — {u.subject}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
