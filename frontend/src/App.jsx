import React, { useState, useEffect } from 'react';
import * as api from './api';

function MinimalApp() {
  const [data, setData] = useState({
    teachers: [],
    rooms: [],
    subjects: [],
    classGroups: [],
    timeslots: [],
    schedule: []
  });

  const loadData = async () => {
    try {
      const [teachers, rooms, subjects, classGroups, timeslots, schedule] = await Promise.all([
        api.getTeachers(),
        api.getRooms(),
        api.getSubjects(),
        api.getClassGroups(),
        api.getTimeSlots(),
        api.getSchedule()
      ]);
      setData({ teachers, rooms, subjects, classGroups, timeslots, schedule });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', maxHoursPerWeek: 40 });
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 30 });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', hoursPerWeek: 4, maxSessionsPerDay: 2 });
  const [newClassGroup, setNewClassGroup] = useState({ name: '', studentCount: 30 });
  const [newTimeSlot, setNewTimeSlot] = useState({ day: 'Monday', startTime: '09:00', endTime: '10:00' });

  const handleCreate = async (type, payload, setter, defaultValue) => {
    try {
      if (type === 'teacher') await api.createTeacher(payload);
      if (type === 'room') await api.createRoom(payload);
      if (type === 'subject') await api.createSubject(payload);
      if (type === 'classGroup') await api.createClassGroup(payload);
      if (type === 'timeSlot') await api.createTimeSlot(payload);
      setter(defaultValue);
      loadData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === 'teacher') await api.deleteTeacher(id);
      if (type === 'room') await api.deleteRoom(id);
      if (type === 'subject') await api.deleteSubject(id);
      if (type === 'classGroup') await api.deleteClassGroup(id);
      if (type === 'timeSlot') await api.deleteTimeSlot(id);
      loadData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const Card = ({ title, count, children, onAdd, inputs }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
      <div className="bg-slate-50 border-t border-slate-200 p-3">
        <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); onAdd(); }}>
          {inputs}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-3 rounded text-sm transition-colors">
            + Add New
          </button>
        </form>
      </div>
    </div>
  );

  const ListItem = ({ children, onDelete }) => (
    <li className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm group">
      <span className="truncate pr-2">{children}</span>
      <button onClick={onDelete} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </li>
  );

  const InputStyle = "w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AutoPlanner Lab</h1>
            <p className="text-slate-500 text-sm mt-1">Minimal testing environment for Timetable Engine</p>
          </div>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* Data Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          <Card 
            title="Teachers" count={data.teachers.length}
            onAdd={() => handleCreate('teacher', newTeacher, setNewTeacher, {name:'', email:'', maxHoursPerWeek:40})}
            inputs={<>
              <input className={InputStyle} value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="Name" required />
              <input className={InputStyle} value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} placeholder="Email / Code" required />
            </>}
          >
            <ul className="flex flex-col">
              {data.teachers.map(t => <ListItem key={t.id} onDelete={() => handleDelete('teacher', t.id)}>{t.name}</ListItem>)}
              {data.teachers.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No teachers</p>}
            </ul>
          </Card>

          <Card 
            title="Rooms" count={data.rooms.length}
            onAdd={() => handleCreate('room', newRoom, setNewRoom, {name:'', capacity:30})}
            inputs={<>
              <input className={InputStyle} value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} placeholder="Room Name" required />
              <input className={InputStyle} type="number" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} placeholder="Capacity" required />
            </>}
          >
            <ul className="flex flex-col">
              {data.rooms.map(r => <ListItem key={r.id} onDelete={() => handleDelete('room', r.id)}>{r.name} (Cap: {r.capacity})</ListItem>)}
              {data.rooms.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No rooms</p>}
            </ul>
          </Card>

          <Card 
            title="Subjects" count={data.subjects.length}
            onAdd={() => handleCreate('subject', newSubject, setNewSubject, {name:'', code:'', hoursPerWeek:4, maxSessionsPerDay:2})}
            inputs={<>
              <input className={InputStyle} value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} placeholder="Subject Name" required />
              <input className={InputStyle} value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} placeholder="Code" required />
            </>}
          >
            <ul className="flex flex-col">
              {data.subjects.map(s => <ListItem key={s.id} onDelete={() => handleDelete('subject', s.id)}>{s.name} [{s.code}]</ListItem>)}
              {data.subjects.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No subjects</p>}
            </ul>
          </Card>

          <Card 
            title="Class Groups" count={data.classGroups.length}
            onAdd={() => handleCreate('classGroup', newClassGroup, setNewClassGroup, {name:'', studentCount:30})}
            inputs={<>
              <input className={InputStyle} value={newClassGroup.name} onChange={e => setNewClassGroup({...newClassGroup, name: e.target.value})} placeholder="Group Name" required />
              <input className={InputStyle} type="number" value={newClassGroup.studentCount} onChange={e => setNewClassGroup({...newClassGroup, studentCount: parseInt(e.target.value)})} placeholder="Size" required />
            </>}
          >
            <ul className="flex flex-col">
              {data.classGroups.map(c => <ListItem key={c.id} onDelete={() => handleDelete('classGroup', c.id)}>{c.name} (Size: {c.studentCount})</ListItem>)}
              {data.classGroups.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No class groups</p>}
            </ul>
          </Card>

          <Card 
            title="Time Slots" count={data.timeslots.length}
            onAdd={() => handleCreate('timeSlot', newTimeSlot, setNewTimeSlot, {day:'Monday', startTime:'09:00', endTime:'10:00'})}
            inputs={<>
              <select className={InputStyle} value={newTimeSlot.day} onChange={e => setNewTimeSlot({...newTimeSlot, day: e.target.value})}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="flex gap-2">
                <input className={InputStyle} type="time" title="Start Time" value={newTimeSlot.startTime} onChange={e => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})} required />
                <input className={InputStyle} type="time" title="End Time" value={newTimeSlot.endTime} onChange={e => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})} required />
              </div>
            </>}
          >
            <ul className="flex flex-col">
              {data.timeslots.map(t => <ListItem key={t.id} onDelete={() => handleDelete('timeSlot', t.id)}>{t.day} {t.startTime}-{t.endTime}</ListItem>)}
              {data.timeslots.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No time slots</p>}
            </ul>
          </Card>

        </div>

        {/* Engine Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Timetable Output</h2>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  try {
                    await api.clearSchedule();
                    loadData();
                  } catch (e) { alert("Error: " + e.message); }
                }}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={async () => {
                  try {
                    await api.generateSchedule();
                    loadData();
                  } catch (e) { alert("Error: " + e.message); }
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Generate Schedule
              </button>
            </div>
          </div>
          
          {data.schedule.length > 0 ? (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 border-b">Class</th>
                    <th className="px-6 py-3 border-b">Subject</th>
                    <th className="px-6 py-3 border-b">Teacher</th>
                    <th className="px-6 py-3 border-b">Room</th>
                    <th className="px-6 py-3 border-b">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.schedule.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-900">{s.classGroup?.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-indigo-600">{s.subject?.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{s.teacher?.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{s.room?.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{s.timeSlot?.day} {s.timeSlot?.startTime}-{s.timeSlot?.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p>No schedule generated yet. Add your data above and click Generate.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MinimalApp;
