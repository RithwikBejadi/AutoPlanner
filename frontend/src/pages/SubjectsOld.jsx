import React, { useEffect, useState } from 'react';
import { getSubjects, createSubject, deleteSubject } from '../api';

const HOUR_COLORS = [
  'bg-primary/20 border-primary/30 text-primary',
  'bg-secondary/20 border-secondary/30 text-secondary',
  'bg-tertiary/20 border-tertiary/30 text-tertiary',
  'bg-violet-400/20 border-violet-400/30 text-violet-300',
  'bg-cyan-400/20 border-cyan-400/30 text-cyan-300',
];

function HoursBar({ hours }) {
  const maxH = 10;
  const pct = Math.min(100, (hours / maxH) * 100);
  const color = hours >= 6 ? 'bg-error' : hours >= 4 ? 'bg-tertiary' : 'bg-secondary';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-outline">Hours / Week</span>
        <span className="text-[10px] font-bold text-on-surface">{hours}h</span>
      </div>
      <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

function SubjectCard({ subject, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const colorIdx = subject.name.charCodeAt(0) % HOUR_COLORS.length;
  const colorClass = HOUR_COLORS[colorIdx];

  return (
    <div className="card card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <span className={`badge border font-mono text-xs ${colorClass}`}>{subject.code}</span>
        <button
          onClick={() => confirming ? onDelete(subject.id) : setConfirming(true)}
          onBlur={() => setConfirming(false)}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
            confirming ? 'bg-error/20 text-error border border-error/30' : 'text-outline hover:text-error hover:bg-error/10'
          }`}
        >
          {confirming ? 'Sure?' : 'Remove'}
        </button>
      </div>
      <h3 className="font-semibold text-on-surface text-sm font-headline leading-snug mb-4">{subject.name}</h3>
      <HoursBar hours={subject.hoursPerWeek} />
    </div>
  );
}

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', hoursPerWeek: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { setSubjects(await getSubjects()); }
    catch { setError('Failed to load subjects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createSubject({ ...form, hoursPerWeek: Number(form.hoursPerWeek) });
      setForm({ name: '', code: '', hoursPerWeek: '' });
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalHours = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Subjects</h1>
          <p className="section-sub">{subjects.length} subjects · {totalHours} total hours/week</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} id="add-subject-btn" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Subject'}
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
          <h2 className="font-headline font-bold text-base text-on-surface">Add New Subject</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="label-tiny">Subject Name</label>
              <input required placeholder="e.g. Linear Algebra" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="input-dark" id="subject-name-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Course Code</label>
              <input required placeholder="e.g. MTH201" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))}
                className="input-dark" id="subject-code-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Hours / Week</label>
              <input required type="number" min="1" max="10" placeholder="e.g. 3" value={form.hoursPerWeek} onChange={e => setForm(f => ({...f, hoursPerWeek: e.target.value}))}
                className="input-dark" id="subject-hours-input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>add</span>
              {submitting ? 'Adding...' : 'Add Subject'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36 bg-surface-container" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>menu_book</span>
          <p className="font-semibold text-on-surface-variant">No subjects yet</p>
          <p className="text-sm text-outline mt-1">Add your first subject to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map(s => (
            <SubjectCard key={s.id} subject={s} onDelete={id => deleteSubject(id).then(load)} />
          ))}
        </div>
      )}
    </div>
  );
}
