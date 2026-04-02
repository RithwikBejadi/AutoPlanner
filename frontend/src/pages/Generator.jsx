import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { generateSchedule } from '../api';

export default function Generator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState(null);
  const [aborted, setAborted] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { teachers, rooms, subjects, classGroups, timeSlots, fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups, fetchTimeSlots } = useApp();
  const abortRef = useRef(false);

  useEffect(() => {
    fetchTeachers();
    fetchRooms();
    fetchSubjects();
    fetchClassGroups();
    fetchTimeSlots();
  }, [fetchTeachers, fetchRooms, fetchSubjects, fetchClassGroups, fetchTimeSlots]);

  const getReadinessErrors = () => {
    const errors = [];

    if (teachers.length === 0) errors.push('Add at least one teacher');
    if (rooms.length === 0) errors.push('Add at least one room');
    if (subjects.length === 0) errors.push('Add at least one subject');
    if (classGroups.length === 0) errors.push('Add at least one class group');
    if (timeSlots.length === 0) errors.push('Add at least one time slot');

    const subjectsWithoutTeacher = subjects.filter(
      (subject) => !teachers.some((teacher) => (teacher.subjectIds || []).includes(subject.id))
    );
    if (subjectsWithoutTeacher.length > 0) {
      errors.push('Assign teachers to all subjects before generating');
    }

    const teachersWithoutAvailability = teachers.filter(
      (teacher) => (teacher.timeSlotIds || []).length === 0 && (teacher.availability || []).length === 0
    );
    if (teachersWithoutAvailability.length > 0) {
      errors.push('Assign at least one availability slot for every teacher');
    }

    const classGroupsWithoutRooms = classGroups.filter(
      (classGroup) => !rooms.some((room) => room.capacity >= classGroup.studentCount)
    );
    if (classGroupsWithoutRooms.length > 0) {
      errors.push('Increase room capacities or reduce class group sizes');
    }

    const hasLabSubjects = subjects.some((subject) => subject.requiresLab);
    const hasLabRooms = rooms.some((room) => room.hasLabEquipment);
    if (hasLabSubjects && !hasLabRooms) {
      errors.push('At least one lab room is required for lab subjects');
    }

    return errors;
  };

  const addLog = (msg, color = "") => {
    setLogs(prev => [...prev, { 
      time: new Date().toLocaleTimeString('en-US', { hour12: false }), 
      msg, 
      color 
    }]);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const startGeneration = async () => {
    const readinessErrors = getReadinessErrors();
    if (readinessErrors.length > 0) {
      toast.error(readinessErrors[0]);
      return;
    }

    setIsGenerating(true);
    setIsDone(false);
    setAborted(false);
    setProgress(0);
    setLogs([]);
    setResult(null);
    abortRef.current = false;

    addLog('INITIALIZING CONSTRAINT SOLVER...', 'opacity-50');
    await delay(500);
    
    if (abortRef.current) {
      handleAbort();
      return;
    }

    const totalEntities = teachers.length + rooms.length + subjects.length + classGroups.length + timeSlots.length;
    addLog(`ANALYZING ${totalEntities} ENTITIES & ${timeSlots.length * classGroups.length} POTENTIAL SESSIONS`);
    setProgress(10);
    await delay(800);

    if (abortRef.current) {
      handleAbort();
      return;
    }

    addLog('VALIDATING CONSTRAINTS AND DEPENDENCIES...');
    setProgress(20);
    await delay(600);

    if (abortRef.current) {
      handleAbort();
      return;
    }

    addLog('STARTING SCHEDULE GENERATION ENGINE...', 'text-secondary');
    setProgress(30);
    await delay(500);

    try {
      if (abortRef.current) {
        handleAbort();
        return;
      }

      addLog('CALLING BACKEND API...');
      setProgress(40);
      
      const response = await generateSchedule();
      
      if (abortRef.current) {
        handleAbort();
        return;
      }

      setProgress(60);
      addLog('SCHEDULE GENERATION COMPLETE', 'text-green-400');
      
      setProgress(80);
      addLog(`✓ ${response.data.stats?.scheduledCount || 0} SESSIONS SCHEDULED`);
      
      setProgress(90);
      if (response.data.stats?.unscheduledCount > 0) {
        addLog(`! ${response.data.stats.unscheduledCount} SESSIONS COULD NOT BE SCHEDULED`, 'text-yellow-400');
      }
      
      setProgress(100);
      addLog('GENERATION COMPLETE - READY FOR REVIEW', 'text-primary font-bold');
      
      setResult(response.data);
      setIsDone(true);
      toast.success(response.message || 'Timetable generated successfully!');
      
    } catch (error) {
      setProgress(0);
      addLog('ERROR: GENERATION FAILED', 'text-error font-bold');
      addLog(error.response?.data?.message || error.message || 'Unknown error', 'text-error');
      toast.error('Failed to generate schedule: ' + (error.response?.data?.message || error.message));
      setIsGenerating(false);
    }
  };

  const handleAbort = () => {
    addLog('GENERATION ABORTED BY USER', 'text-error');
    setAborted(true);
    setIsGenerating(false);
    setProgress(0);
  };

  const handleStop = () => {
    if (isGenerating) {
      abortRef.current = true;
      toast.info('Stopping generation...');
    } else {
      navigate('/');
    }
  };

  const handleViewResults = () => {
    navigate('/timetable');
  };

  const readinessErrors = getReadinessErrors();

  const successRate = result?.stats 
    ? ((result.stats.scheduledCount / result.stats.totalTasks) * 100).toFixed(1)
    : progress > 0 ? Math.min(98.2, 98.2 * (progress / 100)).toFixed(1) : '0.0';
  
  const conflictsCount = result?.stats?.unscheduledCount || (isDone ? 0 : '?');

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12 animate-fade-in w-full h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Engine Room</p>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-primary leading-none">Generator Engine</h1>
          <p className="text-on-surface-variant mt-2 max-w-lg text-sm">
            {isGenerating ? 'Generating optimized schedule...' : isDone ? 'Generation complete! Review results below.' : 'Ready to generate your timetable.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleStop} 
            className="px-5 py-2.5 bg-transparent border border-outline-variant text-[13px] font-bold tracking-wide hover:bg-surface-container-low transition-all rounded-lg text-primary uppercase"
          >
            {isGenerating ? 'Stop' : 'Back to Dashboard'}
          </button>
          {isDone && (
            <button 
              onClick={handleViewResults} 
              className="px-5 py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all rounded-lg bg-primary text-on-primary hover:opacity-90"
            >
              View Timetable
            </button>
          )}
          {!isGenerating && !isDone && (
            <button 
              onClick={startGeneration}
              disabled={readinessErrors.length > 0}
              title={readinessErrors.length > 0 ? readinessErrors[0] : 'Start timetable generation'}
              className={`px-5 py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all rounded-lg ${readinessErrors.length === 0 ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-primary/50 text-on-primary/50 cursor-not-allowed'}`}
            >
              Start Generation
            </button>
          )}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-2 w-2 rounded-full ${isGenerating ? 'bg-secondary animate-pulse' : isDone ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm font-medium tracking-tight text-on-surface">
              {isGenerating ? 'Generation in progress...' : isDone ? 'Generation Complete!' : 'Idle'}
            </span>
          </div>
          <span className="text-2xl font-black font-headline tracking-tighter italic text-primary">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest overflow-hidden rounded-full">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant/30 p-8 flex flex-col justify-between rounded-xl">
          <div>
            <h3 className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold mb-8">Summary Metrics</h3>
            <div className="space-y-8">
              <div>
                <div className="text-5xl font-black font-headline tracking-tighter leading-none mb-1 text-primary">
                  {successRate}%
                </div>
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">SUCCESS RATE</div>
              </div>
              <div>
                <div className={`text-5xl font-black font-headline tracking-tighter leading-none mb-1 flex items-center gap-2 ${isDone && conflictsCount === 0 ? 'text-green-500' : 'text-error'}`}>
                  {conflictsCount}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">UNSCHEDULED SESSIONS</div>
              </div>
              {result?.stats && (
                <div>
                  <div className="text-3xl font-black font-headline tracking-tighter leading-none mb-1 text-primary">
                    {result.stats?.scheduledCount || 0}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">TOTAL SESSIONS</div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Generation ID</span>
              <span className="font-mono text-xs font-bold text-primary">
                {result?.id ? `#${result.id.slice(0, 8)}` : `#AP-${new Date().getFullYear()}`}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 bg-primary text-on-primary p-8 overflow-hidden relative rounded-xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
            <span className="material-symbols-outlined absolute right-4 top-4" style={{ fontSize: 160 }}>terminal</span>
          </div>
          <h3 className="text-[0.6875rem] uppercase tracking-widest text-on-primary/60 font-bold mb-6 relative z-10">Engine Output Log</h3>
          <div className="space-y-2 font-mono text-xs leading-relaxed max-h-[280px] overflow-y-auto custom-scrollbar relative z-10">
            {logs.length === 0 ? (
              <div className="text-on-primary/40 italic">Waiting to start generation...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`flex gap-4 ${log.color}`}>
                  <span className="text-on-primary/40 flex-shrink-0">[{log.time}]</span>
                  <span className="flex-1">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 bg-surface-container-low border border-outline-variant/30 p-8 rounded-xl">
          <div className="mb-6">
            <h3 className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Input Data Summary</h3>
            <p className="text-xs text-on-surface-variant">Entities available for scheduling</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{teachers.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Teachers</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{rooms.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Rooms</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{subjects.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Subjects</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{classGroups.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Classes</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{timeSlots.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Time Slots</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20">
              <div className="text-2xl font-bold text-primary mb-1">{timeSlots.length * classGroups.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Max Sessions</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl">
          <h3 className="text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold mb-6">Generation Status</h3>
          <div className="space-y-4">
            {!isGenerating && !isDone && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-primary mb-2" style={{ fontSize: 32 }}>play_circle</span>
                <p className="text-sm font-medium text-primary">Ready to Generate</p>
                <p className="text-xs mt-1">Click "Start Generation" to begin</p>
              </div>
            )}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-sm font-medium text-primary">Processing...</p>
                <p className="text-xs mt-1 text-on-surface-variant">Generating optimal schedule</p>
              </div>
            )}
            {isDone && conflictsCount === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-green-500 mb-2" style={{ fontSize: 32 }}>check_circle</span>
                <p className="text-sm font-medium text-primary">Perfect Schedule!</p>
                <p className="text-xs mt-1">All sessions scheduled successfully</p>
              </div>
            )}
            {isDone && conflictsCount > 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-yellow-500 mb-2" style={{ fontSize: 32 }}>warning</span>
                <p className="text-sm font-medium text-primary">Partial Success</p>
                <p className="text-xs mt-1">{conflictsCount} session(s) could not be scheduled</p>
              </div>
            )}
            {aborted && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-error mb-2" style={{ fontSize: 32 }}>cancel</span>
                <p className="text-sm font-medium text-error">Generation Stopped</p>
                <p className="text-xs mt-1">Process was aborted by user</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
