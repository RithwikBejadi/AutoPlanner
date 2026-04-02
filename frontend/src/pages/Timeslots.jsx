import React, { useEffect, useState } from 'react';
import { useTimeSlots } from '../hooks';
import { useToast } from '../components/Toast';
import { useFormValidation } from '../hooks/useFormValidation';
import { timeSlotSchema } from '../schemas/validationSchemas';
import { FormInput, FormSelect } from '../components/forms/FormFields';
import { Button, Modal, ConfirmDialog, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TimeSlotCard({ timeSlot, onEdit, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(timeSlot.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-hover animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{fontSize: 20}}>schedule</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-on-surface text-sm">{timeSlot.day}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{timeSlot.startTime} - {timeSlot.endTime}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end gap-2">
          <button onClick={() => onEdit(timeSlot)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors" aria-label="Edit time slot">
            <span className="material-symbols-outlined" style={{fontSize: 16}}>edit</span>
          </button>
          <button onClick={() => setDeleteDialogOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors" aria-label="Delete time slot">
            <span className="material-symbols-outlined" style={{fontSize: 16}}>delete</span>
          </button>
        </div>
      </div>
      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Time Slot" message={`Are you sure you want to delete ${timeSlot.day} ${timeSlot.startTime}-${timeSlot.endTime}? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </>
  );
}

function TimeSlotFormModal({ isOpen, onClose, timeSlot, onSuccess }) {
  const { addTimeSlot, updateTimeSlot } = useTimeSlots();
  const toast = useToast();
  const isEdit = !!timeSlot;

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useFormValidation(
    timeSlotSchema,
    timeSlot || { day: 'Monday', startTime: '09:00', endTime: '10:00' }
  );

  useEffect(() => {
    if (isOpen) {
      reset(timeSlot || { day: 'Monday', startTime: '09:00', endTime: '10:00' });
    }
  }, [isOpen, timeSlot, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateTimeSlot(timeSlot.id, data);
        toast.success('Time slot updated successfully');
      } else {
        await addTimeSlot(data);
        toast.success('Time slot added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Time Slot' : 'Add New Time Slot'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSelect name="day" control={control} label="Day" required icon="calendar_today">
          {DAYS.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </FormSelect>

        <div className="grid grid-cols-2 gap-4">
          <FormInput name="startTime" control={control} label="Start Time" type="time" required icon="schedule" />
          <FormInput name="endTime" control={control} label="End Time" type="time" required icon="schedule" />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" loading={isSubmitting} icon={isEdit ? 'check' : 'add'}>{isEdit ? 'Update Time Slot' : 'Add Time Slot'}</Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Timeslots() {
  const { timeSlots, loading, fetchTimeSlots, deleteTimeSlot } = useTimeSlots();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [filterDay, setFilterDay] = useState('All');

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const handleEdit = (timeSlot) => {
    setEditingTimeSlot(timeSlot);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTimeSlot(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTimeSlot(id);
      toast.success('Time slot deleted successfully');
    } catch (error) {
      handleApiError(error, toast);
      throw error;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTimeSlot(null);
  };

  const filteredTimeSlots = filterDay === 'All' 
    ? timeSlots 
    : timeSlots.filter(ts => ts.day === filterDay);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Time Slots</h1>
          <p className="section-sub">{timeSlots.length} time slots configured</p>
        </div>
        <Button variant="primary" icon="add_circle" onClick={handleAdd}>Add Time Slot</Button>
      </div>

      {timeSlots.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterDay('All')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterDay === 'All' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container text-outline hover:text-on-surface border border-outline-variant/20'}`}>
            All Days ({timeSlots.length})
          </button>
          {DAYS.map(day => {
            const count = timeSlots.filter(ts => ts.day === day).length;
            if (count === 0) return null;
            return (
              <button key={day} onClick={() => setFilterDay(day)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterDay === day ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container text-outline hover:text-on-surface border border-outline-variant/20'}`}>
                {day} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="flex gap-4 items-start"><LoadingSkeleton variant="avatar" /><div className="flex-1 space-y-2"><LoadingSkeleton variant="title" className="w-3/4" /><LoadingSkeleton className="w-1/2" /></div></div></div>
          ))}
        </div>
      ) : filteredTimeSlots.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>schedule</span>
          <p className="font-semibold text-on-surface-variant">No time slots yet</p>
          <p className="text-sm text-outline mt-1">Click "Add Time Slot" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTimeSlots.map(ts => (
            <TimeSlotCard key={ts.id} timeSlot={ts} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <TimeSlotFormModal isOpen={modalOpen} onClose={handleModalClose} timeSlot={editingTimeSlot} onSuccess={fetchTimeSlots} />
    </div>
  );
}
