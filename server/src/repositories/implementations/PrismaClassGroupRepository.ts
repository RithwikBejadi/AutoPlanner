import { ClassGroup } from '../../domain/entities/ClassGroup.js';
import { type IClassGroupRepository } from '../interfaces/IClassGroupRepository.js';
import prisma from '../../database/prisma.js';
import type { ClassGroup as PrismaClassGroup } from '@prisma/client';

export class PrismaClassGroupRepository implements IClassGroupRepository {

  private toDomain(prismaClassGroup: PrismaClassGroup): ClassGroup {
    return new ClassGroup(
      prismaClassGroup.id,
      prismaClassGroup.name,
      prismaClassGroup.studentCount,
      []
    );
  }

  private toPrismaData(classGroup: ClassGroup) {
    return {
      id: classGroup.getId(),
      name: classGroup.getName(),
      studentCount: classGroup.getStudentCount(),
    };
  }

  async create(classGroup: ClassGroup, userId: string): Promise<ClassGroup> {
    const data = {
      ...this.toPrismaData(classGroup),
      userId,
    };
    const created = await prisma.classGroup.create({ data });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<ClassGroup | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    const found = await prisma.classGroup.findUnique({
      where: { id },
    });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<ClassGroup[]> {
    const classGroups = await prisma.classGroup.findMany({
      orderBy: { name: 'asc' }
    });
    return classGroups.map(cg => this.toDomain(cg));
  }

  async findAllByUserId(userId: string): Promise<ClassGroup[]> {
    const classGroups = await prisma.classGroup.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    return classGroups.map(cg => this.toDomain(cg));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ClassGroup | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    const found = await prisma.classGroup.findFirst({
      where: { id, userId },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByName(name: string): Promise<ClassGroup | null> {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid classGroup name');
    }
    
    const found = await prisma.classGroup.findFirst({
      where: { name: name.trim() },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByStudentCountRange(min: number, max: number): Promise<ClassGroup[]> {
    if (min < 0 || max < 0 || !Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('Student count must be a non-negative integer');
    }
    if (min > max) {
      throw new Error('Minimum cannot be greater than maximum');
    }
    
    const classGroups = await prisma.classGroup.findMany({
      where: {
        studentCount: {
          gte: min,
          lte: max
        }
      },
      orderBy: { studentCount: 'asc' }
    });
    return classGroups.map(cg => this.toDomain(cg));
  }

  async update(id: string, classGroup: ClassGroup, userId: string): Promise<ClassGroup> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    const data = this.toPrismaData(classGroup);
    const updated = await prisma.classGroup.update({
      where: { id, userId },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    await prisma.classGroup.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.classGroup.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.classGroup.count({
      where: { id, userId },
    });
    return count > 0;
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    await prisma.classGroup.delete({
      where: { id, userId },
    });
  }
}
