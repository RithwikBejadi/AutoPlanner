import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

export default function Teachers() {
  const {
    teachers,
    subjects,
    timeSlots,
    addTeacher,
    deleteTeacher,
    fetchTeachers,
    fetchSubjects,
    fetchTimeSlots,
  } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({ name: '', subjectIds: [], timeSlotIds: [] });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchTimeSlots();
  }, [fetchTeachers, fetchSubjects, fetchTimeSlots]);

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subjectIds.length === 0) {
      toast.error('Select at least one subject for this teacher');
      return;
    }

    if (formData.timeSlotIds.length === 0) {
      toast.error('Select at least one available time slot for this teacher');
      return;
    }

    try {
      await addTeacher({
        name: formData.name.trim(),
        subjectIds: formData.subjectIds,
        timeSlotIds: formData.timeSlotIds,
      });
      toast.success('Teacher added successfully');
      setFormData({ name: '', subjectIds: [], timeSlotIds: [] });
    } catch (error) {
      toast.error('Failed to add teacher');
    }
  };

  const toggleSelection = (key, value) => {
    setFormData((prev) => {
      const hasValue = prev[key].includes(value);
      return {
        ...prev,
        [key]: hasValue
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto min-h-[calc(100vh-64px)] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary tracking-tight">Teachers</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage staff constraints, department assignments, and availability.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Name</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Subjects</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Availability</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">{getInitials(teacher.name)}</div>
                          <div>
                            <p className="text-sm font-semibold text-primary">{teacher.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{teacher.subjectIds?.length || 0} subjects assigned</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.subjectIds || []).slice(0, 3).map((subjectId) => {
                            const subject = subjectMap.get(subjectId);
                            return (
                              <span key={subjectId} className="text-xs bg-surface-container-high px-2 py-1 rounded text-primary font-medium">
                                {subject?.code || 'Unknown'}
                              </span>
                            );
                          })}
                          {(teacher.subjectIds || []).length > 3 && (
                            <span className="text-xs text-on-surface-variant">+{teacher.subjectIds.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-on-surface-variant">
                          {(teacher.timeSlotIds || []).length > 0
                            ? `${teacher.timeSlotIds.length} slots selected`
                            : `${teacher.availability?.length || 0} slots available`}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => deleteTeacher(teacher.id)} className="p-1 hover:bg-surface-container-highest rounded transition-colors text-on-surface-variant group-hover:text-primary">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-on-surface-variant text-sm">No teachers found.</td>
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
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" placeholder="e.g. Dr. Robert Oppenheimer" type="text"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">Qualified Subjects</label>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2 space-y-2">
                  {subjects.map((subject) => (
                    <label key={subject.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={formData.subjectIds.includes(subject.id)}
                        onChange={() => toggleSelection('subjectIds', subject.id)}
                        className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant/30 rounded"
                      />
                      <span>{subject.code} - {subject.name}</span>
                    </label>
                  ))}
                  {subjects.length === 0 && <p className="text-xs text-on-surface-variant">Add subjects first.</p>}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">Availability Slots</label>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2 space-y-2">
                  {timeSlots.map((slot) => (
                    <label key={slot.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={formData.timeSlotIds.includes(slot.id)}
                        onChange={() => toggleSelection('timeSlotIds', slot.id)}
                        className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant/30 rounded"
                      />
                      <span>{slot.day} {slot.startTime} - {slot.endTime}</span>
                    </label>
                  ))}
                  {timeSlots.length === 0 && <p className="text-xs text-on-surface-variant">Add time slots first.</p>}
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={subjects.length === 0 || timeSlots.length === 0}
                  className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
