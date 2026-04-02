import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as api from '../api';

const AppContext = createContext();

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AppProvider({ children }) {
  // Entity states
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedule, setSchedule] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    teachers: false,
    rooms: false,
    subjects: false,
    classGroups: false,
    timeSlots: false,
    schedule: false,
  });
  
  // Error states
  const [errors, setErrors] = useState({
    teachers: null,
    rooms: null,
    subjects: null,
    classGroups: null,
    timeSlots: null,
    schedule: null,
  });
  
  // Cache timestamps
  const cacheTimestamps = useRef({
    teachers: null,
    rooms: null,
    subjects: null,
    classGroups: null,
    timeSlots: null,
    schedule: null,
  });

  // Helper to check if cache is valid
  const isCacheValid = useCallback((entity) => {
    const timestamp = cacheTimestamps.current[entity];
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
  }, []);

  // Helper to update cache timestamp
  const updateCacheTimestamp = useCallback((entity) => {
    cacheTimestamps.current[entity] = Date.now();
  }, []);

  // Helper to set loading state
  const setEntityLoading = useCallback((entity, isLoading) => {
    setLoading(prev => ({ ...prev, [entity]: isLoading }));
  }, []);

  // Helper to set error state
  const setEntityError = useCallback((entity, error) => {
    setErrors(prev => ({ ...prev, [entity]: error }));
  }, []);

  // Generic fetch function with caching
  const fetchEntity = useCallback(async (entity, fetchFn, setter, skipCache = false) => {
    // Return cached data if valid and not skipping cache
    if (!skipCache && isCacheValid(entity)) {
      return;
    }

    setEntityLoading(entity, true);
    setEntityError(entity, null);

    try {
      const data = await fetchFn();
      setter(data);
      updateCacheTimestamp(entity);
    } catch (error) {
      console.error(`Error fetching ${entity}:`, error);
      setEntityError(entity, error.response?.data?.message || error.message || `Failed to fetch ${entity}`);
    } finally {
      setEntityLoading(entity, false);
    }
  }, [isCacheValid, updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Teachers
  const fetchTeachers = useCallback((skipCache = false) => {
    return fetchEntity('teachers', api.getTeachers, setTeachers, skipCache);
  }, [fetchEntity]);

  const addTeacher = useCallback(async (teacherData) => {
    setEntityLoading('teachers', true);
    setEntityError('teachers', null);
    try {
      const newTeacher = await api.createTeacher(teacherData);
      setTeachers(prev => [...prev, newTeacher]);
      updateCacheTimestamp('teachers');
      return newTeacher;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create teacher';
      setEntityError('teachers', errorMsg);
      throw error;
    } finally {
      setEntityLoading('teachers', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const updateTeacher = useCallback(async (id, teacherData) => {
    setEntityLoading('teachers', true);
    setEntityError('teachers', null);
    try {
      const updatedTeacher = await api.updateTeacher(id, teacherData);
      setTeachers(prev => prev.map(t => t.id === id ? updatedTeacher : t));
      updateCacheTimestamp('teachers');
      return updatedTeacher;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update teacher';
      setEntityError('teachers', errorMsg);
      throw error;
    } finally {
      setEntityLoading('teachers', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const deleteTeacher = useCallback(async (id) => {
    setEntityLoading('teachers', true);
    setEntityError('teachers', null);
    try {
      await api.deleteTeacher(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      updateCacheTimestamp('teachers');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete teacher';
      setEntityError('teachers', errorMsg);
      throw error;
    } finally {
      setEntityLoading('teachers', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Rooms
  const fetchRooms = useCallback((skipCache = false) => {
    return fetchEntity('rooms', api.getRooms, setRooms, skipCache);
  }, [fetchEntity]);

  const addRoom = useCallback(async (roomData) => {
    setEntityLoading('rooms', true);
    setEntityError('rooms', null);
    try {
      const newRoom = await api.createRoom(roomData);
      setRooms(prev => [...prev, newRoom]);
      updateCacheTimestamp('rooms');
      return newRoom;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create room';
      setEntityError('rooms', errorMsg);
      throw error;
    } finally {
      setEntityLoading('rooms', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const updateRoom = useCallback(async (id, roomData) => {
    setEntityLoading('rooms', true);
    setEntityError('rooms', null);
    try {
      const updatedRoom = await api.updateRoom(id, roomData);
      setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r));
      updateCacheTimestamp('rooms');
      return updatedRoom;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update room';
      setEntityError('rooms', errorMsg);
      throw error;
    } finally {
      setEntityLoading('rooms', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const deleteRoom = useCallback(async (id) => {
    setEntityLoading('rooms', true);
    setEntityError('rooms', null);
    try {
      await api.deleteRoom(id);
      setRooms(prev => prev.filter(r => r.id !== id));
      updateCacheTimestamp('rooms');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete room';
      setEntityError('rooms', errorMsg);
      throw error;
    } finally {
      setEntityLoading('rooms', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Subjects
  const fetchSubjects = useCallback((skipCache = false) => {
    return fetchEntity('subjects', api.getSubjects, setSubjects, skipCache);
  }, [fetchEntity]);

  const addSubject = useCallback(async (subjectData) => {
    setEntityLoading('subjects', true);
    setEntityError('subjects', null);
    try {
      const newSubject = await api.createSubject(subjectData);
      setSubjects(prev => [...prev, newSubject]);
      updateCacheTimestamp('subjects');
      return newSubject;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create subject';
      setEntityError('subjects', errorMsg);
      throw error;
    } finally {
      setEntityLoading('subjects', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const updateSubject = useCallback(async (id, subjectData) => {
    setEntityLoading('subjects', true);
    setEntityError('subjects', null);
    try {
      const updatedSubject = await api.updateSubject(id, subjectData);
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
      updateCacheTimestamp('subjects');
      return updatedSubject;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update subject';
      setEntityError('subjects', errorMsg);
      throw error;
    } finally {
      setEntityLoading('subjects', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const deleteSubject = useCallback(async (id) => {
    setEntityLoading('subjects', true);
    setEntityError('subjects', null);
    try {
      await api.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      updateCacheTimestamp('subjects');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete subject';
      setEntityError('subjects', errorMsg);
      throw error;
    } finally {
      setEntityLoading('subjects', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Class Groups
  const fetchClassGroups = useCallback((skipCache = false) => {
    return fetchEntity('classGroups', api.getClassGroups, setClassGroups, skipCache);
  }, [fetchEntity]);

  const addClassGroup = useCallback(async (classGroupData) => {
    setEntityLoading('classGroups', true);
    setEntityError('classGroups', null);
    try {
      const newClassGroup = await api.createClassGroup(classGroupData);
      setClassGroups(prev => [...prev, newClassGroup]);
      updateCacheTimestamp('classGroups');
      return newClassGroup;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create class group';
      setEntityError('classGroups', errorMsg);
      throw error;
    } finally {
      setEntityLoading('classGroups', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const updateClassGroup = useCallback(async (id, classGroupData) => {
    setEntityLoading('classGroups', true);
    setEntityError('classGroups', null);
    try {
      const updatedClassGroup = await api.updateClassGroup(id, classGroupData);
      setClassGroups(prev => prev.map(cg => cg.id === id ? updatedClassGroup : cg));
      updateCacheTimestamp('classGroups');
      return updatedClassGroup;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update class group';
      setEntityError('classGroups', errorMsg);
      throw error;
    } finally {
      setEntityLoading('classGroups', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const deleteClassGroup = useCallback(async (id) => {
    setEntityLoading('classGroups', true);
    setEntityError('classGroups', null);
    try {
      await api.deleteClassGroup(id);
      setClassGroups(prev => prev.filter(cg => cg.id !== id));
      updateCacheTimestamp('classGroups');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete class group';
      setEntityError('classGroups', errorMsg);
      throw error;
    } finally {
      setEntityLoading('classGroups', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Time Slots
  const fetchTimeSlots = useCallback((skipCache = false) => {
    return fetchEntity('timeSlots', api.getTimeSlots, setTimeSlots, skipCache);
  }, [fetchEntity]);

  const addTimeSlot = useCallback(async (timeSlotData) => {
    setEntityLoading('timeSlots', true);
    setEntityError('timeSlots', null);
    try {
      const newTimeSlot = await api.createTimeSlot(timeSlotData);
      setTimeSlots(prev => [...prev, newTimeSlot]);
      updateCacheTimestamp('timeSlots');
      return newTimeSlot;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create time slot';
      setEntityError('timeSlots', errorMsg);
      throw error;
    } finally {
      setEntityLoading('timeSlots', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const updateTimeSlot = useCallback(async (id, timeSlotData) => {
    setEntityLoading('timeSlots', true);
    setEntityError('timeSlots', null);
    try {
      const updatedTimeSlot = await api.updateTimeSlot(id, timeSlotData);
      setTimeSlots(prev => prev.map(ts => ts.id === id ? updatedTimeSlot : ts));
      updateCacheTimestamp('timeSlots');
      return updatedTimeSlot;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update time slot';
      setEntityError('timeSlots', errorMsg);
      throw error;
    } finally {
      setEntityLoading('timeSlots', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  const deleteTimeSlot = useCallback(async (id) => {
    setEntityLoading('timeSlots', true);
    setEntityError('timeSlots', null);
    try {
      await api.deleteTimeSlot(id);
      setTimeSlots(prev => prev.filter(ts => ts.id !== id));
      updateCacheTimestamp('timeSlots');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete time slot';
      setEntityError('timeSlots', errorMsg);
      throw error;
    } finally {
      setEntityLoading('timeSlots', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Schedule
  const fetchSchedule = useCallback((skipCache = false) => {
    return fetchEntity('schedule', api.getSchedule, setSchedule, skipCache);
  }, [fetchEntity]);

  const generateSchedule = useCallback(async () => {
    setEntityLoading('schedule', true);
    setEntityError('schedule', null);
    try {
      const result = await api.generateSchedule();
      // Refresh schedule after generation
      await fetchSchedule(true);
      return result;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate schedule';
      setEntityError('schedule', errorMsg);
      throw error;
    } finally {
      setEntityLoading('schedule', false);
    }
  }, [fetchSchedule, setEntityLoading, setEntityError]);

  const clearSchedule = useCallback(async () => {
    setEntityLoading('schedule', true);
    setEntityError('schedule', null);
    try {
      await api.clearSchedule();
      setSchedule([]);
      updateCacheTimestamp('schedule');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to clear schedule';
      setEntityError('schedule', errorMsg);
      throw error;
    } finally {
      setEntityLoading('schedule', false);
    }
  }, [updateCacheTimestamp, setEntityLoading, setEntityError]);

  // Invalidate all caches
  const invalidateAllCaches = useCallback(() => {
    cacheTimestamps.current = {
      teachers: null,
      rooms: null,
      subjects: null,
      classGroups: null,
      timeSlots: null,
      schedule: null,
    };
  }, []);

  const value = {
    // State
    teachers,
    rooms,
    subjects,
    classGroups,
    timeSlots,
    schedule,
    loading,
    errors,
    
    // Teachers
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    
    // Rooms
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    
    // Subjects
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    
    // Class Groups
    fetchClassGroups,
    addClassGroup,
    updateClassGroup,
    deleteClassGroup,
    
    // Time Slots
    fetchTimeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    
    // Schedule
    fetchSchedule,
    generateSchedule,
    clearSchedule,
    
    // Cache management
    invalidateAllCaches,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
