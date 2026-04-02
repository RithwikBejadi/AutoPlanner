import { useApp } from '../context/AppContext';

export function useClassGroups() {
  const {
    classGroups,
    loading,
    errors,
    fetchClassGroups,
    addClassGroup,
    updateClassGroup,
    deleteClassGroup,
  } = useApp();

  return {
    classGroups,
    loading: loading.classGroups,
    error: errors.classGroups,
    fetchClassGroups,
    addClassGroup,
    updateClassGroup,
    deleteClassGroup,
  };
}
