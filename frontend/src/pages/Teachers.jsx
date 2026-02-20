import React, { useEffect, useState } from 'react';
import { getTeachers, createTeacher, deleteTeacher } from '../api';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setTeachers(await getTeachers());
    } catch { setError('Failed to load teachers.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTeacher(form);
      setForm({ name: '', email: '' });
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to create teacher.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teachers</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4">
        <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          className="border rounded px-3 py-2 flex-1 min-w-40" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
          className="border rounded px-3 py-2 flex-1 min-w-48" />
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800">Add Teacher</button>
      </form>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Availability slots</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teachers.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.email}</td>
                  <td className="px-4 py-3 text-gray-500">{t.availability?.length ?? 0} slots</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteTeacher(t.id).then(load)} className="text-red-500 hover:underline text-xs">Remove</button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No teachers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
