import { ClassGroup } from '../../domain/entities/ClassGroup.js';

export interface IClassGroupRepository {
  create(classGroup: ClassGroup, userId: string): Promise<ClassGroup>;
  
  findById(id: string): Promise<ClassGroup | null>;
  findAll(): Promise<ClassGroup[]>;
  findAllByUserId(userId: string): Promise<ClassGroup[]>;
  findByIdAndUserId(id: string, userId: string): Promise<ClassGroup | null>;
  findByName(name: string): Promise<ClassGroup | null>;
  findByStudentCountRange(min: number, max: number): Promise<ClassGroup[]>;
  
  update(id: string, classGroup: ClassGroup, userId: string): Promise<ClassGroup>;
  
  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
