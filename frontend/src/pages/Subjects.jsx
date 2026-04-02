import React, { useEffect, useState } from 'react';
import { useSubjects } from '../hooks';
import { useToast } from '../components/Toast';
import { useFormValidation } from '../hooks/useFormValidation';
import { subjectSchema } from '../schemas/validationSchemas';
import { FormInput, FormToggle } from '../components/forms/FormFields';
import { Button, Modal, ConfirmDialog, LoadingSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandling';

const HOUR_COLORS = [
  'bg-primary/20 border-primary/30 text-primary',
  'bg-secondary/20 border-secondary/30 text-secondary',
  'bg-tertiary/20 border-tertiary/30 text-tertiary',
  'bg-violet-400/20 border-violet-400/30 text-violet-300',
  'bg-cyan-400/20 border-cyan-400/30 text-cyan-300',
];

function HoursBar({ hours }) {
  const maxH = 10;
  const pct = Math.min(100, (hours / maxH) * 100);
  const color = hours >= 6 ? 'bg-error' : hours >= 4 ? 'bg-tertiary' : 'bg-secondary';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-outline">Hours / Week</span>
        <span className="text-[10px] font-bold text-on-surface">{hours}h</span>
      </div>
      <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

function SubjectCard({ subject, onEdit, onDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colorIdx = subject.name.charCodeAt(0) % HOUR_COLORS.length;
  const colorClass = HOUR_COLORS[colorIdx];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(subject.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-hover animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <span className={`badge border font-mono text-xs ${colorClass}`}>{subject.code}</span>
          <div className="flex gap-2">
            <button onClick={() => onEdit(subject)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors" aria-label="Edit subject">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>edit</span>
            </button>
            <button onClick={() => setDeleteDialogOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors" aria-label="Delete subject">
              <span className="material-symbols-outlined" style={{fontSize: 16}}>delete</span>
            </button>
          </div>
        </div>
        <h3 className="font-semibold text-on-surface text-sm font-headline leading-snug mb-4">{subject.name}</h3>
        <div className="space-y-3">
          <HoursBar hours={subject.hoursPerWeek} />
          <div className="flex gap-2 flex-wrap">
            {subject.requiresLab && (
              <span className="badge bg-tertiary/10 text-tertiary border border-tertiary/20">Lab Required</span>
            )}
            <span className="badge bg-surface-container-high text-outline border border-outline-variant/20">Max {subject.maxSessionsPerDay}/day</span>
          </div>
        </div>
      </div>
      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Subject" message={`Are you sure you want to delete ${subject.name}? This action cannot be undone.`} confirmText="Delete" variant="danger" loading={deleting} />
    </>
  );
}

function SubjectFormModal({ isOpen, onClose, subject, onSuccess }) {
  const { addSubject, updateSubject } = useSubjects();
  const toast = useToast();
  const isEdit = !!subject;

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useFormValidation(
    subjectSchema,
    subject || { name: '', code: '', hoursPerWeek: 4, requiresLab: false, maxSessionsPerDay: 2 }
  );

  useEffect(() => {
    if (isOpen) {
      reset(subject || { name: '', code: '', hoursPerWeek: 4, requiresLab: false, maxSessionsPerDay: 2 });
    }
  }, [isOpen, subject, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateSubject(subject.id, data);
        toast.success(`${data.name} updated successfully`);
      } else {
        await addSubject(data);
        toast.success(`${data.name} added successfully`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Subject' : 'Add New Subject'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="name" control={control} label="Subject Name" placeholder="e.g. Advanced Mathematics" required icon="book" />
        <FormInput name="code" control={control} label="Subject Code" placeholder="e.g. MATH-401" required icon="tag" hint="Uppercase letters, numbers, and hyphens only" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="hoursPerWeek" control={control} label="Hours per Week" type="number" placeholder="e.g. 4" required icon="schedule" />
          <FormInput name="maxSessionsPerDay" control={control} label="Max Sessions/Day" type="number" placeholder="e.g. 2" required icon="event" />
        </div>
        <FormToggle name="requiresLab" control={control} label="Requires Lab Equipment" description="This subject needs rooms with lab facilities" />
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" loading={isSubmitting} icon={isEdit ? 'check' : 'add'}>{isEdit ? 'Update Subject' : 'Add Subject'}</Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Subjects() {
  const { subjects, loading, fetchSubjects, deleteSubject } = useSubjects();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubject(id);
      toast.success('Subject deleted successfully');
    } catch (error) {
      handleApiError(error, toast);
      throw error;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubject(null);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Subjects</h1>
          <p className="section-sub">{subjects.length} subjects in curriculum</p>
        </div>
        <Button variant="primary" icon="add_circle" onClick={handleAdd}>Add Subject</Button>
      </div>

      {subjects.length > 0 && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>search</span>
          <input type="text" placeholder="Search subjects by name or code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-dark pl-12 w-full max-w-md" />
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
            <div key={i} className="card animate-pulse"><div className="space-y-3"><LoadingSkeleton variant="title" className="w-1/4" /><LoadingSkeleton variant="title" className="w-3/4" /><LoadingSkeleton className="w-full" /><LoadingSkeleton className="w-1/2" /></div></div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-outline mb-4" style={{fontSize: 48}}>{searchQuery ? 'search_off' : 'book'}</span>
          <p className="font-semibold text-on-surface-variant">{searchQuery ? 'No subjects found' : 'No subjects yet'}</p>
          <p className="text-sm text-outline mt-1">{searchQuery ? 'Try a different search term' : 'Click "Add Subject" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubjects.map(s => (
            <SubjectCard key={s.id} subject={s} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <SubjectFormModal isOpen={modalOpen} onClose={handleModalClose} subject={editingSubject} onSuccess={fetchSubjects} />
    </div>
  );
}
