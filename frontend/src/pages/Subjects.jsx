import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

export default function Subjects() {
  const { subjects, addSubject, deleteSubject, fetchSubjects } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hoursPerWeek: 4,
    maxSessionsPerDay: 2,
    requiresLab: false,
  });

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSubject({
        ...formData,
        code: formData.code.toUpperCase().trim(),
        hoursPerWeek: Number(formData.hoursPerWeek),
        maxSessionsPerDay: Number(formData.maxSessionsPerDay),
      });
      toast.success('Subject added successfully');
      setFormData({ name: '', code: '', hoursPerWeek: 4, maxSessionsPerDay: 2, requiresLab: false });
    } catch (error) {
      toast.error('Failed to add subject');
    }
  };

  return (
    <div className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto min-h-[calc(100vh-64px)] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary tracking-tight">Subjects</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage curricular subjects and their lab requirements.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Code</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Name</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Hours/Week</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Max/Day</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Requirements</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {subjects.map(subject => (
                    <tr key={subject.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-4 py-4">
                        <span className="text-xs bg-surface-container-high px-2 py-1 rounded text-primary font-bold tracking-widest uppercase">{subject.code}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-primary">{subject.name}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">
                        {subject.hoursPerWeek}
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">
                        {subject.maxSessionsPerDay}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {subject.requiresLab ? (
                          <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded font-medium">Requires Lab</span>
                        ) : (
                          <span className="text-xs bg-surface-container-high text-on-surface-variant px-2 py-1 rounded font-medium">Standard</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => deleteSubject(subject.id)} className="p-1 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant group-hover:text-primary">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-on-surface-variant text-sm">No subjects found.</td>
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
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Subject Code</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none uppercase" placeholder="e.g. MATH101" type="text"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Subject Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" placeholder="e.g. Advanced Calculus" type="text"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Hours Per Week</label>
                  <input required value={formData.hoursPerWeek} onChange={e => setFormData({...formData, hoursPerWeek: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" type="number" min="1" max="40"/>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Max Sessions / Day</label>
                  <input required value={formData.maxSessionsPerDay} onChange={e => setFormData({...formData, maxSessionsPerDay: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" type="number" min="1" max="10"/>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input id="requiresLab" type="checkbox" checked={formData.requiresLab} onChange={e => setFormData({...formData, requiresLab: e.target.checked})} className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant/30 rounded focus:ring-primary focus:ring-2 transition-all outline-none"/>
                <label htmlFor="requiresLab" className="text-sm font-medium text-on-surface-variant">Requires Lab Room?</label>
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