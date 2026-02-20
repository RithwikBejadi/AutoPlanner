import React, { useEffect, useState } from 'react';
import { getClassGroups, createClassGroup, deleteClassGroup } from '../api';

export default function ClassGroups() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', studentCount: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try { setGroups(await getClassGroups()); }
    catch { setError('Failed to load class groups.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createClassGroup({ ...form, studentCount: Number(form.studentCount) });
      setForm({ name: '', studentCount: '' });
      load();
    } catch(e) { setError(e.response?.data?.error || 'Failed to create class group.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Class Groups</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 flex flex-wrap gap-4">
        <input required placeholder="Group name (e.g. CS-A)" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          className="border rounded px-3 py-2 flex-1 min-w-40" />
        <input required type="number" min="1" placeholder="Student count" value={form.studentCount} onChange={e => setForm(f => ({...f, studentCount: e.target.value}))}
          className="border rounded px-3 py-2 w-36" />
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800">Add Group</button>
      </form>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map(g => (
                <tr key={g.id}>
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3 text-gray-500">{g.studentCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteClassGroup(g.id).then(load)} className="text-red-500 hover:underline text-xs">Remove</button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No class groups yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
