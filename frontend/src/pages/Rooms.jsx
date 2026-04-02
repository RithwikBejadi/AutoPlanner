import React, { useEffect, useState } from 'react';
import { useRooms } from '../hooks';
import { useToast } from '../components/Toast';
import { useFormValidation } from '../hooks/useFormValidation';
import { roomSchema } from '../schemas/validationSchemas';
import { FormInput, FormToggle } from '../components/forms/FormFields';
import { Button, Modal, ConfirmDialog, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

function RoomCard({ room, onEdit, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(room.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-hover animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary" style={{fontSize: 20}}>
                {room.hasLabEquipment ? 'science' : 'meeting_room'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-on-surface text-sm">{room.name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Capacity: {room.capacity} students</p>
            </div>
          </div>
        </div>
        {room.hasLabEquipment && (
          <div className="mt-3">
            <span className="badge bg-tertiary/10 text-tertiary border border-tertiary/20">
              Lab Equipment
            </span>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end gap-2">
          <button
            onClick={() => onEdit(room)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors"
            aria-label="Edit room"
          >
            <span className="material-symbols-outlined" style={{fontSize: 16}}>edit</span>
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors"
            aria-label="Delete room"
          >
            <span className="material-symbols-outlined" style={{fontSize: 16}}>delete</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete ${room.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}

function RoomFormModal({ isOpen, onClose, room, onSuccess }) {
  const { addRoom, updateRoom } = useRooms();
  const toast = useToast();
  const isEdit = !!room;

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useFormValidation(
    roomSchema,
    room || { name: '', capacity: 30, hasLabEquipment: false }
  );

  useEffect(() => {
    if (isOpen) {
      reset(room || { name: '', capacity: 30, hasLabEquipment: false });
    }
  }, [isOpen, room, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateRoom(room.id, data);
        toast.success(`${data.name} updated successfully`);
      } else {
        await addRoom(data);
        toast.success(`${data.name} added successfully`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Room' : 'Add New Room'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="name"
          control={control}
          label="Room Name"
          placeholder="e.g. Room 101 or Lab A"
          required
          icon="meeting_room"
        />

        <FormInput
          name="capacity"
          control={control}
          label="Capacity"
          type="number"
          placeholder="e.g. 30"
          required
          icon="groups"
        />

        <FormToggle
          name="hasLabEquipment"
          control={control}
          label="Lab Equipment"
          description="This room has specialized laboratory equipment"
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" loading={isSubmitting} icon={isEdit ? 'check' : 'add'}>
            {isEdit ? 'Update Room' : 'Add Room'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Rooms() {
  const { rooms, loading, fetchRooms, deleteRoom } = useRooms();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleEdit = (room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id);
      toast.success('Room deleted successfully');
    } catch (error) {
      handleApiError(error, toast);
      throw error;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingRoom(null);
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Rooms</h1>
          <p className="section-sub">{rooms.length} rooms available</p>
        </div>
        <Button variant="primary" icon="add_circle" onClick={handleAdd}>
          Add Room
        </Button>
      </div>

      {rooms.length > 0 && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-12 w-full max-w-md"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4 items-start">
                <LoadingSkeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton variant="title" className="w-3/4" />
                  <LoadingSkeleton className="w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>
            {searchQuery ? 'search_off' : 'meeting_room'}
          </span>
          <p className="font-semibold text-on-surface-variant">
            {searchQuery ? 'No rooms found' : 'No rooms yet'}
          </p>
          <p className="text-sm text-outline mt-1">
            {searchQuery ? 'Try a different search term' : 'Click "Add Room" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(r => (
            <RoomCard key={r.id} room={r} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <RoomFormModal isOpen={modalOpen} onClose={handleModalClose} room={editingRoom} onSuccess={fetchRooms} />
    </div>
  );
}
