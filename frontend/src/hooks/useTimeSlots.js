import { useApp } from '../context/AppContext';

export function useTimeSlots() {
  const {
    timeSlots,
    loading,
    errors,
    fetchTimeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
  } = useApp();

  return {
    timeSlots,
    loading: loading.timeSlots,
    error: errors.timeSlots,
    fetchTimeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
  };
}
