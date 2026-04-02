import React, { useEffect, useState } from 'react';
import { useTeachers } from '../hooks';
import { useToast } from '../components/Toast';
import { useFormValidation } from '../hooks/useFormValidation';
import { teacherSchema } from '../schemas/validationSchemas';
import { FormInput } from '../components/forms/FormFields';
import { Button, Modal, ConfirmDialog, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

function InitialsAvatar({ name }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: `hsl(${hue}, 40%, 25%)`, color: `hsl(${hue}, 60%, 75%)` }}
    >
      {initials}
    </div>
  );
}

function TeacherCard({ teacher, onEdit, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(teacher.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-hover animate-fade-in">
        <div className="flex items-start gap-4">
          <InitialsAvatar name={teacher.name} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-on-surface text-sm truncate">{teacher.name}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{teacher.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined" style={{fontSize: 14}}>schedule</span>
            <span>{teacher.availability?.length ?? 0} availability slots</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(teacher)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors"
              aria-label="Edit teacher"
            >
              <span className="material-symbols-outlined" style={{fontSize: 16}}>edit</span>
            </button>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors"
              aria-label="Delete teacher"
            >
              <span className="material-symbols-outlined" style={{fontSize: 16}}>delete</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}

function TeacherFormModal({ isOpen, onClose, teacher, onSuccess }) {
  const { addTeacher, updateTeacher } = useTeachers();
  const toast = useToast();
  const isEdit = !!teacher;

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useFormValidation(
    teacherSchema,
    teacher || { name: '', email: '' }
  );

  useEffect(() => {
    if (isOpen) {
      reset(teacher || { name: '', email: '' });
    }
  }, [isOpen, teacher, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateTeacher(teacher.id, data);
        toast.success(`${data.name} updated successfully`);
      } else {
        await addTeacher(data);
        toast.success(`${data.name} added successfully`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Teacher' : 'Add New Teacher'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="name"
          control={control}
          label="Full Name"
          placeholder="e.g. Dr. Jane Smith"
          required
          icon="person"
        />

        <FormInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="e.g. jane.smith@uni.edu"
          required
          icon="email"
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={isEdit ? 'check' : 'add'}
          >
            {isEdit ? 'Update Teacher' : 'Add Teacher'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Teachers() {
  const { teachers, loading, fetchTeachers, deleteTeacher } = useTeachers();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTeacher(id);
      toast.success('Teacher deleted successfully');
    } catch (error) {
      handleApiError(error, toast);
      throw error;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTeacher(null);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Teachers</h1>
          <p className="section-sub">{teachers.length} faculty members registered</p>
        </div>
        <Button
          variant="primary"
          icon="person_add"
          onClick={handleAdd}
        >
          Add Teacher
        </Button>
      </div>

      {/* Search Bar */}
      {teachers.length > 0 && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-12 w-full max-w-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
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
      ) : filteredTeachers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>
            {searchQuery ? 'search_off' : 'school'}
          </span>
          <p className="font-semibold text-on-surface-variant">
            {searchQuery ? 'No teachers found' : 'No teachers yet'}
          </p>
          <p className="text-sm text-outline mt-1">
            {searchQuery ? 'Try a different search term' : 'Click "Add Teacher" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.map(t => (
            <TeacherCard
              key={t.id}
              teacher={t}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TeacherFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        teacher={editingTeacher}
        onSuccess={fetchTeachers}
      />
    </div>
  );
}
