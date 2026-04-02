import { Teacher } from '../../domain/entities/Teacher.js';

export interface ITeacherRepository {
  create(teacher: Teacher, subjectIds: string[], timeSlotIds: string[], userId: string): Promise<Teacher>;
  
  findById(id: string): Promise<Teacher | null>;
  findAll(): Promise<Teacher[]>;
  findAllByUserId(userId: string): Promise<Teacher[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
  findBySubject(subjectId: string): Promise<Teacher[]>;
  findAvailableAt(timeSlotId: string): Promise<Teacher[]>;
  
  update(id: string, teacher: Teacher, subjectIds: string[], timeSlotIds: string[], userId: string): Promise<Teacher>;
  
  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
