import { useApp } from '../context/AppContext';

export function useTeachers() {
  const {
    teachers,
    loading,
    errors,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  } = useApp();

  return {
    teachers,
    loading: loading.teachers,
    error: errors.teachers,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  };
}
