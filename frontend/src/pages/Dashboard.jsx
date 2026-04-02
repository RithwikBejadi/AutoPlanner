import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import * as api from '../api';

export default function Dashboard() {
  const { teachers, rooms, subjects, classGroups, fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups, loading } = useApp();
  const [timetables, setTimetables] = useState([]);
  const [loadingTimetables, setLoadingTimetables] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
    fetchRooms();
    fetchSubjects();
    fetchClassGroups();
    
    setLoadingTimetables(true);
    api.getTimetables()
      .then(setTimetables)
      .catch(err => {
        if (err.response?.status !== 404 && err.response?.status !== 401) {
          toast.error('Failed to load recent timetables');
        }
      })
      .finally(() => setLoadingTimetables(false));
  }, [fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups]);

  const isLoading = Object.values(loading).some(v => v) || loadingTimetables;

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    try {
      await api.deleteTimetable(id);
      setTimetables(prev => prev.filter(t => t.id !== id));
      toast.success('Timetable deleted successfully');
    } catch (e) {
      toast.error('Failed to delete timetable');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto min-h-full animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-secondary font-label">Overview</span>
          <h1 className="text-4xl font-headline tracking-tight text-primary">Dashboard</h1>
          <p className="text-on-surface-variant text-sm max-w-md mt-2">Manage your institutional assets and generate optimized schedules in seconds.</p>
        </div>
        <Link to="/timetable/generate" className="bg-primary text-on-primary-fixed px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm w-fit">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Generate New Timetable
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-medium text-sm">Teachers</span>
            <span className="material-symbols-outlined text-outline">person</span>
          </div>
          <div className="text-3xl font-headline text-primary">{isLoading ? '...' : teachers.length}</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
            <span>Active Now</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-medium text-sm">Rooms</span>
            <span className="material-symbols-outlined text-outline">meeting_room</span>
          </div>
          <div className="text-3xl font-headline text-primary">{isLoading ? '...' : rooms.length}</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span>{rooms.filter(r => r.hasLabEquipment)?.length || 0} Specialized Labs</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-medium text-sm">Subjects</span>
            <span className="material-symbols-outlined text-outline">book</span>
          </div>
          <div className="text-3xl font-headline text-primary">{isLoading ? '...' : subjects.length}</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span>{subjects.filter(s => s.requiresLab)?.length || 0} Requiring Labs</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-xl hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-medium text-sm">Classes</span>
            <span className="material-symbols-outlined text-outline">groups</span>
          </div>
          <div className="text-3xl font-headline text-primary">{isLoading ? '...' : classGroups.length}</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <span>{classGroups.reduce((sum, c) => sum + (c.studentCount || 0), 0)} Total Students</span>
          </div>
        </div>
      </div>

      
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <h2 className="text-xl font-headline text-primary">Recent Generations</h2>
          <Link to="/timetable" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">View Current</Link>
        </div>
        
        <div className="overflow-x-auto">
          {timetables.length === 0 ? (
            <div className="text-center text-on-surface-variant py-8">
              {loadingTimetables ? 'Loading...' : 'No timetables generated yet. Generate your first one today!'}
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 md:px-6 py-3 font-medium">Timetable Name</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Date Generated</th>
                  <th className="px-4 md:px-6 py-3 font-medium">Status / Entries</th>
                  <th className="px-4 md:px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {timetables.map((t, index) => (
                  <tr key={t.id} className="bg-white hover:bg-surface-container-low transition-colors group rounded-xl">
                    <td className="px-4 md:px-6 py-4 font-semibold text-primary rounded-l-lg truncate max-w-xs" title={"Timetable ID: " + t.id}>
                      {index === 0 ? 'Latest Generation' : `Archive #${timetables.length - index}`}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-on-surface-variant">
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${index === 0 ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        <span className={`w-1 h-1 rounded-full ${index === 0 ? 'bg-secondary' : 'bg-on-surface-variant'}`}></span>
                        {index === 0 ? 'Active' : 'Archived'}
                        <span className="ml-1 text-[9px] uppercase font-bold text-on-surface-variant opacity-70">({t.entryCount} Entries)</span>
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right rounded-r-lg flex justify-end gap-1">
                      {index === 0 && (
                        <Link to="/timetable" title="View Current" className="p-2 hover:bg-surface-container-high rounded transition-colors text-outline group-hover:text-primary inline-flex">
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>visibility</span>
                        </Link>
                      )}
                      <button onClick={() => handleDeleteTimetable(t.id)} title="Delete Generation" className="p-2 hover:bg-error/10 hover:text-error rounded transition-colors text-outline inline-flex" disabled={loadingTimetables}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Dynamic Resource Highlights */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/teachers" className="relative group block p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/50 transition-all overflow-hidden h-32 flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10 transition-all duration-500">
            <span className="material-symbols-outlined text-9xl">person</span>
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-1 relative z-10">Manage Staff</span>
          <h3 className="text-xl font-headline text-on-surface relative z-10">Teachers & Assignments</h3>
        </Link>
        <Link to="/subjects" className="relative group block p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/50 transition-all overflow-hidden h-32 flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-10 transition-all duration-500">
            <span className="material-symbols-outlined text-9xl">menu_book</span>
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-1 relative z-10">Curriculum</span>
          <h3 className="text-xl font-headline text-on-surface relative z-10">Courses & Labs</h3>
        </Link>
        <Link to="/rooms" className="relative group block p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/50 transition-all overflow-hidden h-32 flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10 transition-all duration-500">
            <span className="material-symbols-outlined text-9xl">meeting_room</span>
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-1 relative z-10">Facilities</span>
          <h3 className="text-xl font-headline text-on-surface relative z-10">Rooms & Capacities</h3>
        </Link>
      </section>
</div>
  );
}