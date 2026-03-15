import { Subject } from '../../domain/entities/Subject.js';

export interface ISubjectRepository {
  create(subject: Subject): Promise<Subject>;
  

  findById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  findByCode(code: string): Promise<Subject | null>;
  

  update(id: string, subject: Subject): Promise<Subject>;
  

  delete(id: string): Promise<void>;
  

  exists(id: string): Promise<boolean>;
}
