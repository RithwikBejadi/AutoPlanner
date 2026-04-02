import { useApp } from '../context/AppContext';

export function useSchedule() {
  const {
    schedule,
    loading,
    errors,
    fetchSchedule,
    generateSchedule,
    clearSchedule,
  } = useApp();

  return {
    schedule,
    loading: loading.schedule,
    error: errors.schedule,
    fetchSchedule,
    generateSchedule,
    clearSchedule,
  };
}
