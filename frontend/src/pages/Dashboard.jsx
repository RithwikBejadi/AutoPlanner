import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Button, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

const statCards = [
  { key: 'teachers', label: 'Teachers', icon: 'school', to: '/teachers', color: 'from-primary to-primary-dim' },
  { key: 'rooms', label: 'Rooms', icon: 'meeting_room', to: '/rooms', color: 'from-secondary to-cyan-400' },
  { key: 'subjects', label: 'Subjects', icon: 'menu_book', to: '/subjects', color: 'from-tertiary to-violet-400' },
  { key: 'classGroups', label: 'Class Groups', icon: 'groups', to: '/class-groups', color: 'from-primary to-indigo-400' },
  { key: 'timeSlots', label: 'Time Slots', icon: 'schedule', to: '/timeslots', color: 'from-secondary to-teal-400' },
  { key: 'schedule', label: 'Scheduled Sessions', icon: 'calendar_view_week', to: '/timetable', color: 'from-tertiary to-purple-400' },
];

function StatCard({ label, value, icon, to, color, loading }) {
  return (
    <Link to={to} className="card card-hover group relative overflow-hidden cursor-pointer">
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="flex items-start justify-between mb-4">
        <span className={`material-symbols-outlined bg-gradient-to-br ${color} bg-clip-text text-transparent`} style={{fontSize: 22, fontVariationSettings: "'FILL' 1"}}>
          {icon}
        </span>
        <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity" style={{fontSize: 14}}>arrow_outward</span>
      </div>
      <div>
        {loading ? (
          <LoadingSkeleton variant="title" className="w-16 mb-1" />
        ) : (
          <p className="stat-number">{value}</p>
        )}
        <p className="label-tiny mt-1">{label}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { 
    teachers, rooms, subjects, classGroups, timeSlots, schedule,
    fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups, fetchTimeSlots, fetchSchedule,
    generateSchedule, loading
  } = useApp();
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchRooms();
    fetchSubjects();
    fetchClassGroups();
    fetchTimeSlots();
    fetchSchedule();
  }, [fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups, fetchTimeSlots, fetchSchedule]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const genResult = await generateSchedule();
      setResult(genResult);
      toast.success('Schedule generated successfully!');
    } catch (error) {
      handleApiError(error, toast);
    } finally {
      setGenerating(false);
    }
  };

  const stats = {
    teachers: teachers.length,
    rooms: rooms.length,
    subjects: subjects.length,
    classGroups: classGroups.length,
    timeSlots: timeSlots.length,
    schedule: schedule.length,
  };

  const isLoading = loading.teachers || loading.rooms || loading.subjects || 
                    loading.classGroups || loading.timeSlots || loading.schedule;

  const roomUtil = stats.rooms > 0 && stats.schedule > 0 
    ? Math.min(100, Math.round((stats.schedule / (stats.rooms * stats.timeSlots)) * 100)) 
    : 0;
  const teacherCov = stats.teachers > 0 && stats.schedule > 0
    ? Math.min(100, Math.round((stats.schedule / (stats.teachers * stats.timeSlots)) * 100))
    : 0;
  const density = stats.timeSlots > 0 && stats.schedule > 0
    ? Math.min(100, Math.round((stats.schedule / stats.timeSlots) * 100))
    : 0;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="section-title">Command Center</h1>
        <p className="section-sub">Smart timetable generator dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            value={stats[card.key]}
            icon={card.icon}
            to={card.to}
            color={card.color}
            loading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-fixed" style={{fontSize: 20}}>auto_awesome</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">Optimizer Engine</h2>
              <p className="text-xs text-on-surface-variant">Generate constraint-based schedule</p>
            </div>
          </div>

          <Button
            variant="primary"
            icon="play_arrow"
            onClick={handleGenerate}
            loading={generating}
            disabled={stats.teachers === 0 || stats.rooms === 0 || stats.subjects === 0 || stats.classGroups === 0 || stats.timeSlots === 0}
            className="w-full"
          >
            {generating ? 'Generating Schedule...' : 'Generate Timetable'}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high border border-outline-variant/10">
                <div>
                  <p className="text-xs text-outline mb-1">Status</p>
                  <p className="font-semibold text-on-surface">{result.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-outline mb-1">Assigned</p>
                  <p className="text-2xl font-bold text-success">{result.totalAssigned}</p>
                </div>
              </div>

              {result.totalUnassigned > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-error text-xs font-semibold">
                    <span className="material-symbols-outlined" style={{fontSize: 14}}>warning</span>
                    {result.totalUnassigned} sessions unscheduled
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    {result.unassigned?.map((u, i) => (
                      <div key={i} className="text-xs p-2 rounded-lg bg-error/5 border border-error/10 text-outline">
                        {u.classGroup} - {u.subject}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-headline font-bold text-base text-on-surface mb-6">System Status</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-outline">Room Utilization</span>
                <span className="font-bold text-on-surface">{roomUtil}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all" style={{width: `${roomUtil}%`}} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-outline">Teacher Coverage</span>
                <span className="font-bold text-on-surface">{teacherCov}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-tertiary to-secondary rounded-full transition-all" style={{width: `${teacherCov}%`}} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-outline">Schedule Density</span>
                <span className="font-bold text-on-surface">{density}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all" style={{width: `${density}%`}} />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-outline mb-1">DATA ENTITIES</p>
                <p className="text-xl font-bold text-on-surface">{stats.teachers + stats.rooms + stats.subjects + stats.classGroups}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline mb-1">WEEKLY SLOTS</p>
                <p className="text-xl font-bold text-on-surface">{stats.timeSlots}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-headline font-bold text-base text-on-surface mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(card => (
            <Link
              key={card.key}
              to={card.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/10 hover:border-primary/20 transition-all group"
            >
              <span className={`material-symbols-outlined bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} style={{fontSize: 24}}>
                {card.icon}
              </span>
              <span className="text-xs text-outline group-hover:text-on-surface transition-colors text-center">{card.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
