import React, { useEffect, useState } from 'react';
import { getClassGroups, createClassGroup, deleteClassGroup } from '../api';

const BG_COLORS = [
  'bg-primary/10 border-primary/20',
  'bg-secondary/10 border-secondary/20',
  'bg-tertiary/10 border-tertiary/20',
  'bg-indigo-400/10 border-indigo-400/20',
  'bg-teal-400/10 border-teal-400/20',
];

function GroupCard({ group, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const colorIdx = group.name.charCodeAt(0) % BG_COLORS.length;
  const bgClass = BG_COLORS[colorIdx];

  return (
    <div className={`card card-hover animate-fade-in relative overflow-hidden ${bgClass}`}>
      <div className="absolute -right-6 -bottom-6 opacity-10">
        <span className="material-symbols-outlined" style={{fontSize: 100}}>groups</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize: 20}}>diversity_3</span>
          </div>
          <button
            onClick={() => confirming ? onDelete(group.id) : setConfirming(true)}
            onBlur={() => setConfirming(false)}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              confirming ? 'bg-error/20 text-error border border-error/30' : 'bg-surface-container/50 text-outline hover:text-error'
            }`}
          >
            {confirming ? 'Sure?' : 'Remove'}
          </button>
        </div>
        <h3 className="font-semibold text-on-surface text-lg font-headline mb-1">{group.name}</h3>
        <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined" style={{fontSize: 16}}>person</span>
          <span>{group.studentCount} Students</span>
        </div>
      </div>
    </div>
  );
}

export default function ClassGroups() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', studentCount: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { setGroups(await getClassGroups()); }
    catch { setError('Failed to load class groups.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createClassGroup({ ...form, studentCount: Number(form.studentCount) });
      setForm({ name: '', studentCount: '' });
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalStudents = groups.reduce((sum, g) => sum + g.studentCount, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Class Groups</h1>
          <p className="section-sub">{groups.length} groups · {totalStudents} total students</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} id="add-group-btn" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>{showForm ? 'close' : 'group_add'}</span>
          {showForm ? 'Cancel' : 'Add Group'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 text-error rounded-2xl px-5 py-4 text-sm">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>error_outline</span>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-fade-in space-y-4">
          <h2 className="font-headline font-bold text-base text-on-surface">Add New Class Group</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label-tiny">Group Name</label>
              <input required placeholder="e.g. CS-Year-1-A" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="input-dark" id="group-name-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Student Count</label>
              <input required type="number" min="1" placeholder="e.g. 30" value={form.studentCount} onChange={e => setForm(f => ({...f, studentCount: e.target.value}))}
                className="input-dark" id="group-students-input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>add</span>
              {submitting ? 'Adding...' : 'Add Group'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36 bg-surface-container" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>groups</span>
          <p className="font-semibold text-on-surface-variant">No class groups yet</p>
          <p className="text-sm text-outline mt-1">Create a group to start scheduling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map(g => (
            <GroupCard key={g.id} group={g} onDelete={id => deleteClassGroup(id).then(load)} />
          ))}
        </div>
      )}
    </div>
  );
}
