import React, { useEffect, useState } from 'react';
import { getTimeslots, createTimeslot, deleteTimeslot } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timeslots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ day: 'Monday', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try { setSlots(await getTimeslots()); }
    catch { setError('Failed to load time slots.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTimeslot(form);
      setForm(f => ({ ...f, startTime: '', endTime: '' }));
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to create time slot.'); }
  };

  const byDay = DAYS.map(day => ({ day, slots: slots.filter(s => s.day === day) }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Time Slots</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4">
        <select value={form.day} onChange={e => setForm(f => ({...f, day: e.target.value}))}
          className="border rounded px-3 py-2">
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>
        <input required type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))}
          className="border rounded px-3 py-2" />
        <input required type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
          className="border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800">Add Slot</button>
      </form>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid md:grid-cols-5 gap-4">
          {byDay.map(({ day, slots }) => (
            <div key={day} className="bg-white shadow rounded-xl p-4">
              <h3 className="font-semibold text-blue-700 mb-3">{day}</h3>
              <ul className="space-y-2">
                {slots.map(s => (
                  <li key={s.id} className="flex justify-between items-center text-sm">
                    <span>{s.startTime} – {s.endTime}</span>
                    <button onClick={() => deleteTimeslot(s.id).then(load)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </li>
                ))}
                {slots.length === 0 && <li className="text-gray-400 text-xs">None</li>}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
