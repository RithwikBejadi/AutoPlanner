import React, { useEffect, useState } from 'react';
import { getRooms, createRoom, deleteRoom } from '../api';

const TYPE_META = {
  LECTURE: { label: 'Lecture', icon: 'podium', color: 'text-primary bg-primary/10 border-primary/20' },
  LAB: { label: 'Laboratory', icon: 'science', color: 'text-secondary bg-secondary/10 border-secondary/20' },
  SEMINAR: { label: 'Seminar', icon: 'record_voice_over', color: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
};

function CapacityBar({ capacity }) {
  const maxCapacity = 200;
  const pct = Math.min(100, Math.round((capacity / maxCapacity) * 100));
  const color = pct > 80 ? 'bg-tertiary' : pct > 50 ? 'bg-secondary' : 'bg-primary';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-outline">Capacity</span>
        <span className="text-[10px] font-bold text-on-surface">{capacity}</span>
      </div>
      <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

function RoomCard({ room, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const meta = TYPE_META[room.type] || TYPE_META.LECTURE;

  return (
    <div className="card card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-2 badge border ${meta.color}`}>
          <span className="material-symbols-outlined" style={{fontSize: 13, fontVariationSettings: "'FILL' 1"}}>{meta.icon}</span>
          {meta.label}
        </div>
        <button
          onClick={() => confirming ? onDelete(room.id) : setConfirming(true)}
          onBlur={() => setConfirming(false)}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
            confirming ? 'bg-error/20 text-error border border-error/30' : 'text-outline hover:text-error hover:bg-error/10'
          }`}
        >
          {confirming ? 'Sure?' : 'Remove'}
        </button>
      </div>
      <h3 className="font-semibold text-on-surface text-base font-headline">{room.name}</h3>
      <div className="mt-4">
        <CapacityBar capacity={room.capacity} />
      </div>
    </div>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: '', capacity: '', type: 'LECTURE' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const load = async () => {
    try { setRooms(await getRooms()); }
    catch { setError('Failed to load rooms.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createRoom({ ...form, capacity: Number(form.capacity) });
      setForm({ name: '', capacity: '', type: 'LECTURE' });
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = typeFilter === 'ALL' ? rooms : rooms.filter(r => r.type === typeFilter);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Rooms</h1>
          <p className="section-sub">{rooms.length} rooms configured</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} id="add-room-btn" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{fontSize: 18}}>{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Room'}
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
          <h2 className="font-headline font-bold text-base text-on-surface">Add New Room</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="label-tiny">Room Name</label>
              <input required placeholder="e.g. Lab 302" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="input-dark" id="room-name-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Capacity</label>
              <input required type="number" min="1" placeholder="e.g. 40" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))}
                className="input-dark" id="room-capacity-input" />
            </div>
            <div className="space-y-1.5">
              <label className="label-tiny">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="select-dark w-full" id="room-type-select">
                <option value="LECTURE">Lecture</option>
                <option value="LAB">Laboratory</option>
                <option value="SEMINAR">Seminar</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>add</span>
              {submitting ? 'Adding...' : 'Add Room'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-2">
        {['ALL', 'LECTURE', 'LAB', 'SEMINAR'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              typeFilter === t
                ? 'bg-surface-container-high text-secondary border-secondary/30'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-primary/20'
            }`}
          >
            {t === 'ALL' ? 'All Rooms' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36 bg-surface-container" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>meeting_room</span>
          <p className="font-semibold text-on-surface-variant">No rooms found</p>
          <p className="text-sm text-outline mt-1">{rooms.length > 0 ? 'Try another filter' : 'Add your first room'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(r => (
            <RoomCard key={r.id} room={r} onDelete={id => deleteRoom(id).then(load)} />
          ))}
        </div>
      )}
    </div>
  );
}
