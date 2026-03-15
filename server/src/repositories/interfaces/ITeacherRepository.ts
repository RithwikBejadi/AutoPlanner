import { Teacher } from '../../domain/entities/Teacher.js';

export interface ITeacherRepository {
  create(teacher: Teacher, subjectIds: string[], timeSlotIds: string[]): Promise<Teacher>;
  
  findById(id: string): Promise<Teacher | null>;
  findAll(): Promise<Teacher[]>;
  findByEmail(email: string): Promise<Teacher | null>;
  findBySubject(subjectId: string): Promise<Teacher[]>;
  findAvailableAt(timeSlotId: string): Promise<Teacher[]>;
  
  update(id: string, teacher: Teacher, subjectIds: string[], timeSlotIds: string[]): Promise<Teacher>;
  
  delete(id: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
}
