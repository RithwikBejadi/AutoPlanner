import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Teachers
export const getTeachers = () => api.get('/teachers').then(r => r.data);
export const createTeacher = (data) => api.post('/teachers', data).then(r => r.data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`).then(r => r.data);

// Rooms
export const getRooms = () => api.get('/rooms').then(r => r.data);
export const createRoom = (data) => api.post('/rooms', data).then(r => r.data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`).then(r => r.data);

// Subjects
export const getSubjects = () => api.get('/subjects').then(r => r.data);
export const createSubject = (data) => api.post('/subjects', data).then(r => r.data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`).then(r => r.data);

// Class Groups
export const getClassGroups = () => api.get('/class-groups').then(r => r.data);
export const createClassGroup = (data) => api.post('/class-groups', data).then(r => r.data);
export const deleteClassGroup = (id) => api.delete(`/class-groups/${id}`).then(r => r.data);

// Time Slots
export const getTimeslots = () => api.get('/timeslots').then(r => r.data);
export const createTimeslot = (data) => api.post('/timeslots', data).then(r => r.data);
export const deleteTimeslot = (id) => api.delete(`/timeslots/${id}`).then(r => r.data);

// Schedule
export const getSchedule = () => api.get('/schedule').then(r => r.data);
export const getScheduleByClass = (id) => api.get(`/schedule/by-class/${id}`).then(r => r.data);
export const getScheduleByTeacher = (id) => api.get(`/schedule/by-teacher/${id}`).then(r => r.data);
export const getScheduleByRoom = (id) => api.get(`/schedule/by-room/${id}`).then(r => r.data);
export const generateSchedule = () => api.post('/schedule/generate').then(r => r.data);
export const clearSchedule = () => api.delete('/schedule').then(r => r.data);
