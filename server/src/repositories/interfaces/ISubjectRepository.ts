import { Subject } from '../../domain/entities/Subject.js';

export interface ISubjectRepository {
  create(subject: Subject, userId: string): Promise<Subject>;
  

  findById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  findAllByUserId(userId: string): Promise<Subject[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Subject | null>;
  findByCode(code: string): Promise<Subject | null>;
  

  update(id: string, subject: Subject, userId: string): Promise<Subject>;
  

  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
  

  exists(id: string): Promise<boolean>;
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
