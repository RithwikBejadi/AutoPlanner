import React, { useEffect, useState } from 'react';
import { getSubjects, createSubject, deleteSubject } from '../api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', hoursPerWeek: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try { setSubjects(await getSubjects()); }
    catch { setError('Failed to load subjects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubject({ ...form, hoursPerWeek: Number(form.hoursPerWeek) });
      setForm({ name: '', code: '', hoursPerWeek: '' });
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to create subject.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subjects</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4">
        <input required placeholder="Subject name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          className="border rounded px-3 py-2 flex-1 min-w-40" />
        <input required placeholder="Code (e.g. CS101)" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))}
          className="border rounded px-3 py-2 w-36" />
        <input required type="number" min="1" max="10" placeholder="Hours/week" value={form.hoursPerWeek} onChange={e => setForm(f => ({...f, hoursPerWeek: e.target.value}))}
          className="border rounded px-3 py-2 w-32" />
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800">Add Subject</button>
      </form>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Hours / Week</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjects.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.code}</td>
                  <td className="px-4 py-3 text-gray-500">{s.hoursPerWeek}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteSubject(s.id).then(load)} className="text-red-500 hover:underline text-xs">Remove</button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No subjects yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
