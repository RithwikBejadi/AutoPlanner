import { useApp } from '../context/AppContext';

export function useSubjects() {
  const {
    subjects,
    loading,
    errors,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useApp();

  return {
    subjects,
    loading: loading.subjects,
    error: errors.subjects,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
  };
}
