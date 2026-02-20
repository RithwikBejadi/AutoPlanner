import React, { useEffect, useState } from 'react';
import { getRooms, createRoom, deleteRoom } from '../api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: '', capacity: '', type: 'LECTURE' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try { setRooms(await getRooms()); }
    catch { setError('Failed to load rooms.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRoom({ ...form, capacity: Number(form.capacity) });
      setForm({ name: '', capacity: '', type: 'LECTURE' });
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to create room.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rooms</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4">
        <input required placeholder="Room name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          className="border rounded px-3 py-2 flex-1 min-w-32" />
        <input required type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))}
          className="border rounded px-3 py-2 w-32" />
        <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
          className="border rounded px-3 py-2">
          <option value="LECTURE">Lecture</option>
          <option value="LAB">Lab</option>
          <option value="SEMINAR">Seminar</option>
        </select>
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800">Add Room</button>
      </form>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rooms.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.capacity}</td>
                  <td className="px-4 py-3 text-gray-500">{r.type}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteRoom(r.id).then(load)} className="text-red-500 hover:underline text-xs">Remove</button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No rooms yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
