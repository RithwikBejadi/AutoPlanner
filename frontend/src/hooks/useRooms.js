import { useApp } from '../context/AppContext';

export function useRooms() {
  const {
    rooms,
    loading,
    errors,
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
  } = useApp();

  return {
    rooms,
    loading: loading.rooms,
    error: errors.rooms,
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
  };
}
