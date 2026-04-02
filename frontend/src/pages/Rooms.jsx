import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

export default function Rooms() {
  const { rooms, addRoom, deleteRoom } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({ name: '', capacity: 30, hasLabEquipment: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addRoom({ ...formData, capacity: parseInt(formData.capacity, 10) });
      toast.success('Room added successfully');
      setFormData({ name: '', capacity: 30, hasLabEquipment: false });
    } catch (error) {
      toast.error('Failed to add room');
    }
  };

  return (
    <div className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto min-h-[calc(100vh-64px)] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary tracking-tight">Rooms</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage physical spaces, capacities, and lab designations.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Room Name</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Capacity</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Type</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">R</div>
                          <div>
                            <p className="text-sm font-semibold text-primary">{room.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">
                        {room.capacity} seats
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {room.hasLabEquipment ? (
                          <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded font-medium">Lab</span>
                        ) : (
                          <span className="text-xs bg-surface-container-high text-on-surface-variant px-2 py-1 rounded font-medium">Lecture</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => deleteRoom(room.id)} className="p-1 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant group-hover:text-primary">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-on-surface-variant text-sm">No rooms found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Quick Register</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Room Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" placeholder="e.g. Room 101, Chem Lab" type="text"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Capacity</label>
                <input required value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" type="number" min="1"/>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input id="hasLabEquipment" type="checkbox" checked={formData.hasLabEquipment} onChange={e => setFormData({...formData, hasLabEquipment: e.target.checked})} className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant/30 rounded focus:ring-primary focus:ring-2 transition-all outline-none"/>
                <label htmlFor="hasLabEquipment" className="text-sm font-medium text-on-surface-variant">Is Specialized Lab?</label>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:opacity-90 active:scale-[0.98] transition-all">Save Entity</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}