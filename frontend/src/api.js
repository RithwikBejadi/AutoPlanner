import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ 
  baseURL: API_BASE_URL,
  withCredentials: true
});

const isDev = import.meta.env.DEV;

if (isDev) {
  api.interceptors.request.use(
    (config) => {
      if (config.url !== '/auth/me') {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isDev && error.response?.status !== 401) {
      console.error('[API Error]', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);



export const getCurrentUser = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);

export const getTeachers = () => api.get('/teachers').then(r => r.data.data);
export const createTeacher = (data) => api.post('/teachers', data).then(r => r.data.data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data).then(r => r.data.data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`).then(r => r.data.data);


export const getRooms = () => api.get('/rooms').then(r => r.data.data);
export const createRoom = (data) => api.post('/rooms', data).then(r => r.data.data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data).then(r => r.data.data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`).then(r => r.data.data);


export const getSubjects = () => api.get('/subjects').then(r => r.data.data);
export const createSubject = (data) => api.post('/subjects', data).then(r => r.data.data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data).then(r => r.data.data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`).then(r => r.data.data);


export const getClassGroups = () => api.get('/class-groups').then(r => r.data.data);
export const createClassGroup = (data) => api.post('/class-groups', data).then(r => r.data.data);
export const updateClassGroup = (id, data) => api.put(`/class-groups/${id}`, data).then(r => r.data.data);
export const deleteClassGroup = (id) => api.delete(`/class-groups/${id}`).then(r => r.data.data);


export const getTimeSlots = () => api.get('/timeslots').then(r => r.data.data);
export const createTimeSlot = (data) => api.post('/timeslots', data).then(r => r.data.data);
export const updateTimeSlot = (id, data) => api.put(`/timeslots/${id}`, data).then(r => r.data.data);
export const deleteTimeSlot = (id) => api.delete(`/timeslots/${id}`).then(r => r.data.data);

// Legacy aliases for backward compatibility
export const getTimeslots = getTimeSlots;
export const createTimeslot = createTimeSlot;
export const deleteTimeslot = deleteTimeSlot;

export const getTimetables = () => api.get('/timetables').then(r => r.data.data);
export const deleteTimetable = (id) => api.delete(`/timetables/${id}`).then(r => r.data);

export const getSchedule = async () => {
  try {
    const r = await api.get('/timetables/latest');
    return r.data.data.entries || [];
  } catch (e) {
    if (e.response && e.response.status === 404) return [];
    throw e;
  }
};

const getLatestId = async () => {
  const r = await api.get('/timetables/latest');
  return r.data.data.id;
};

export const getScheduleByClass = async (id) => {
  try {
    const tId = await getLatestId();
    return api.get(`/timetables/entries?timetableId=${tId}&classGroupId=${id}`).then(r => r.data.data || []);
  } catch (e) { return []; }
};

export const getScheduleByTeacher = async (id) => {
  try {
    const tId = await getLatestId();
    return api.get(`/timetables/entries?timetableId=${tId}&teacherId=${id}`).then(r => r.data.data || []);
  } catch (e) { return []; }
};

export const getScheduleByRoom = async (id) => {
  try {
    const tId = await getLatestId();
    return api.get(`/timetables/entries?timetableId=${tId}&roomId=${id}`).then(r => r.data.data || []);
  } catch (e) { return []; }
};

export const generateSchedule = async (config = {}) => {
  const r = await api.post('/timetables/generate', {}, config);
  const d = r.data.data;
  return {
    data: d,
    message: r.data.message,
    totalAssigned: d.stats?.scheduledCount || 0,
    totalUnassigned: d.stats?.unscheduledCount || 0,
    unassigned: d.unscheduled?.map(u => ({ classGroup: u.classGroup?.name || 'Unknown', subject: u.subject?.name || 'Unknown' })) || [],
  };
};

export const clearSchedule = async () => {
  const tId = await getLatestId();
  if (tId) {
    return api.delete(`/timetables/${tId}`).then(r => r.data);
  }
};
