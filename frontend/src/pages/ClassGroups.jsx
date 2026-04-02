import React, { useEffect, useState } from 'react';
import { useClassGroups } from '../hooks';
import { useToast } from '../components/Toast';
import { useFormValidation } from '../hooks/useFormValidation';
import { classGroupSchema } from '../schemas/validationSchemas';
import { FormInput } from '../components/forms/FormFields';
import { Button, Modal, ConfirmDialog, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

function ClassGroupCard({ classGroup, onEdit, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hue = classGroup.name.charCodeAt(0) % 360;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(classGroup.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-hover animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${hue}, 40%, 25%)` }}>
            <span className="material-symbols-outlined" style={{fontSize: 20, color: `hsl(${hue}, 60%, 75%)`}}>groups</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-on-surface text-sm">{classGroup.name}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{classGroup.studentCount} students</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end gap-2">
          <button onClick={() => onEdit(classGroup)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors" aria-label="Edit class">
            <span className="material-symbols-outlined" style={{fontSize: 16}}>edit</span>
          </button>
          <button onClick={() => setDeleteDialogOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors" aria-label="Delete class">
            <span className="material-symbols-outlined" style={{fontSize: 16}}>delete</span>
          </button>
        </div>
      </div>
      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Class Group" message={`Are you sure you want to delete ${classGroup.name}? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </>
  );
}

function ClassGroupFormModal({ isOpen, onClose, classGroup, onSuccess }) {
  const { addClassGroup, updateClassGroup } = useClassGroups();
  const toast = useToast();
  const isEdit = !!classGroup;

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useFormValidation(
    classGroupSchema,
    classGroup || { name: '', studentCount: 30 }
  );

  useEffect(() => {
    if (isOpen) {
      reset(classGroup || { name: '', studentCount: 30 });
    }
  }, [isOpen, classGroup, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateClassGroup(classGroup.id, data);
        toast.success(`${data.name} updated successfully`);
      } else {
        await addClassGroup(data);
        toast.success(`${data.name} added successfully`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Class Group' : 'Add New Class Group'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="name" control={control} label="Class Name" placeholder="e.g. CS-2024-A or Grade 10-A" required icon="school" />
        <FormInput name="studentCount" control={control} label="Number of Students" type="number" placeholder="e.g. 30" required icon="groups" />
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" loading={isSubmitting} icon={isEdit ? 'check' : 'add'}>{isEdit ? 'Update Class' : 'Add Class'}</Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ClassGroups() {
  const { classGroups, loading, fetchClassGroups, deleteClassGroup } = useClassGroups();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClassGroup, setEditingClassGroup] = useState(null);

  useEffect(() => {
    fetchClassGroups();
  }, [fetchClassGroups]);

  const handleEdit = (classGroup) => {
    setEditingClassGroup(classGroup);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClassGroup(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteClassGroup(id);
      toast.success('Class group deleted successfully');
    } catch (error) {
      handleApiError(error, toast);
      throw error;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingClassGroup(null);
  };

  const filteredClassGroups = classGroups.filter(cg =>
    cg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Class Groups</h1>
          <p className="section-sub">{classGroups.length} class groups registered</p>
        </div>
        <Button variant="primary" icon="add_circle" onClick={handleAdd}>Add Class Group</Button>
      </div>

      {classGroups.length > 0 && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>search</span>
          <input type="text" placeholder="Search class groups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-dark pl-12 w-full max-w-md" />
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
            <div key={i} className="card animate-pulse"><div className="flex gap-4 items-start"><LoadingSkeleton variant="avatar" /><div className="flex-1 space-y-2"><LoadingSkeleton variant="title" className="w-3/4" /><LoadingSkeleton className="w-1/2" /></div></div></div>
          ))}
        </div>
      ) : filteredClassGroups.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>{searchQuery ? 'search_off' : 'groups'}</span>
          <p className="font-semibold text-on-surface-variant">{searchQuery ? 'No class groups found' : 'No class groups yet'}</p>
          <p className="text-sm text-outline mt-1">{searchQuery ? 'Try a different search term' : 'Click "Add Class Group" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClassGroups.map(cg => (
            <ClassGroupCard key={cg.id} classGroup={cg} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ClassGroupFormModal isOpen={modalOpen} onClose={handleModalClose} classGroup={editingClassGroup} onSuccess={fetchClassGroups} />
    </div>
  );
}
