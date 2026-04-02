import React, { useEffect, useState } from 'react';
import { getTimeslots, createTimeslot, deleteTimeslot } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timeslots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ day: 'Monday', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { setSlots(await getTimeslots()); }
    catch { setError('Failed to load time slots.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createTimeslot(form);
      setForm(f => ({ ...f, startTime: '', endTime: '' }));
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create time slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const byDay = DAYS.map(day => ({ 
    day, 
    slots: slots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) 
  }));

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Time Slots</h1>
          <p className="section-sub">{slots.length} total blocks configured across the week</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} id="add-slot-btn" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>{showForm ? 'close' : 'add_alarm'}</span>
          {showForm ? 'Cancel' : 'Add Time Slot'}
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
          <h2 className="font-headline font-bold text-base text-on-surface">Add Time Slot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="label-tiny">Day of Week</label>
              <select value={form.day} onChange={e => setForm(f => ({...f, day: e.target.value}))} className="select-dark w-full" id="slot-day-select">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Start Time</label>
              <input required type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))}
                className="input-dark" id="slot-start-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">End Time</label>
              <input required type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
                className="input-dark" id="slot-end-input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>add</span>
              {submitting ? 'Adding...' : 'Add Slot'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-64 bg-surface-container" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {byDay.map(({ day, slots }) => (
            <div key={day} className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col">
              <div className="p-4 bg-surface-container-highest border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-headline font-bold text-on-surface text-sm">{day}</h3>
                <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{slots.length}</span>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {slots.map(s => (
                  <div key={s.id} className="group relative bg-surface-container p-3 rounded-xl border border-outline-variant/5 hover:border-error/30 hover:bg-error/5 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-outline" style={{fontSize: 14}}>schedule</span>
                      <span className="text-xs font-semibold text-on-surface">{s.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined opacity-0" style={{fontSize: 14}}>arrow_downward</span>
                      <span className="text-xs">{s.endTime}</span>
                    </div>
                    <button
                      onClick={() => deleteTimeslot(s.id).then(load)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-on-error"
                      title="Remove Slot"
                    >
                      <span className="material-symbols-outlined" style={{fontSize: 18}}>delete</span>
                    </button>
                  </div>
                ))}
                {slots.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-8 opacity-40">
                    <span className="material-symbols-outlined mb-2" style={{fontSize: 24}}>block</span>
                    <span className="text-xs">No slots</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
