import { ClassGroup } from '../../domain/entities/ClassGroup.js';

export interface IClassGroupRepository {
  create(classGroup: ClassGroup): Promise<ClassGroup>;
  
  findById(id: string): Promise<ClassGroup | null>;
  findAll(): Promise<ClassGroup[]>;
  findByName(name: string): Promise<ClassGroup | null>;
  findByStudentCountRange(min: number, max: number): Promise<ClassGroup[]>;
  
  update(id: string, classGroup: ClassGroup): Promise<ClassGroup>;
  
  delete(id: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
}
