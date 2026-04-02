import { Subject } from '../../domain/entities/Subject.js';
import { type ISubjectRepository } from '../interfaces/ISubjectRepository.js';
import prisma from '../../database/prisma.js';
import type { Subject as PrismaSubject } from '@prisma/client';

export class PrismaSubjectRepository implements ISubjectRepository {

  private toDomain(prismaSubject: PrismaSubject): Subject {
    return new Subject(
      prismaSubject.id,
      prismaSubject.name,
      prismaSubject.code,
      prismaSubject.hoursPerWeek,
      prismaSubject.requiresLab,
      prismaSubject.maxSessionsPerDay
    );
  }

  private toPrismaData(subject: Subject) {
    return {
      id: subject.getId(),
      name: subject.getName(),
      code: subject.getCode(),
      hoursPerWeek: subject.getHoursPerWeek(),
      requiresLab: subject.requiresLab(),
      maxSessionsPerDay: subject.getMaxSessionsPerDay(),
    };
  }


  async create(subject: Subject, userId: string): Promise<Subject> {
    const data = {
      ...this.toPrismaData(subject),
      userId,
    };
    const created = await prisma.subject.create({ data });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Subject | null> {
    const found = await prisma.subject.findUnique({
      where: { id },
    });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany();
    return subjects.map(s => this.toDomain(s));
  }

  async findAllByUserId(userId: string): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany({
      where: { userId },
    });
    return subjects.map(s => this.toDomain(s));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Subject | null> {
    const found = await prisma.subject.findFirst({
      where: { id, userId },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCode(code: string): Promise<Subject | null> {
    const found = await prisma.subject.findFirst({
      where: { code },
    });
    return found ? this.toDomain(found) : null;
  }

  async update(id: string, subject: Subject, userId: string): Promise<Subject> {
    const data = this.toPrismaData(subject);
    const updated = await prisma.subject.update({
      where: { id, userId },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.subject.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.subject.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
    const count = await prisma.subject.count({
      where: { id, userId },
    });
    return count > 0;
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    await prisma.subject.delete({
      where: { id, userId },
    });
  }
}
