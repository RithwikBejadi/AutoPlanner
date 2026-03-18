import { Teacher } from '../../domain/entities/Teacher.js';
import { TimeSlot } from '../../domain/entities/TimeSlot.js';
import { type ITeacherRepository } from '../interfaces/ITeacherRepository.js';
import prisma from '../../database/prisma.js';
import type { Teacher as PrismaTeacher } from '@prisma/client';

export class PrismaTeacherRepository implements ITeacherRepository {

  private async toDomain(prismaTeacher: PrismaTeacher): Promise<Teacher> {
    
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: prismaTeacher.id },
      select: { subjectId: true }
    });
    
    const teacherTimeSlots = await prisma.teacherTimeSlot.findMany({
      where: { teacherId: prismaTeacher.id },
      include: { timeSlot: true }
    });
    
    const subjectIds = teacherSubjects.map(ts => ts.subjectId);
    const availability = teacherTimeSlots.map(tts => 
      this.prismaTimeSlotToDomain(tts.timeSlot)
    );
    
    return new Teacher(
      prismaTeacher.id,
      prismaTeacher.name,
      subjectIds,
      availability
    );
  }

  private prismaTimeSlotToDomain(prismaTimeSlot: any): TimeSlot {
    const startTime = this.parseTimeString(prismaTimeSlot.startTime);
    const endTime = this.parseTimeString(prismaTimeSlot.endTime);
    return new TimeSlot(prismaTimeSlot.day, startTime, endTime, prismaTimeSlot.id);
  }

  private parseTimeString(timeStr: string): Date {
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    const hours = parseInt(parts[0]!, 10);
    const minutes = parseInt(parts[1]!, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  async create(teacher: Teacher, subjectIds: string[], timeSlotIds: string[]): Promise<Teacher> {
    
    if (!subjectIds || subjectIds.length === 0) {
      throw new Error('Teacher must have at least one subject');
    }
    if (!timeSlotIds || timeSlotIds.length === 0) {
      throw new Error('Teacher must have at least one availability slot');
    }
    
    
    const created = await prisma.$transaction(async (tx) => {
      
      const newTeacher = await tx.teacher.create({
        data: {
          id: teacher.getId(),
          name: teacher.getName(),
          email: `${teacher.getId()}@school.edu`, 
        }
      });
      
      
      await tx.teacherSubject.createMany({
        data: subjectIds.map(subjectId => ({
          teacherId: newTeacher.id,
          subjectId: subjectId
        }))
      });
      
      
      await tx.teacherTimeSlot.createMany({
        data: timeSlotIds.map(timeSlotId => ({
          teacherId: newTeacher.id,
          timeSlotId: timeSlotId
        }))
      });
      
      return newTeacher;
    });
    
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Teacher | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid teacher ID');
    }
    
    const found = await prisma.teacher.findUnique({
      where: { id },
    });
    
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Teacher[]> {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' }
    });
    
    return Promise.all(teachers.map(t => this.toDomain(t)));
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email');
    }
    
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    const found = await prisma.teacher.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    
    return found ? this.toDomain(found) : null;
  }

  async findBySubject(subjectId: string): Promise<Teacher[]> {
    if (!subjectId || typeof subjectId !== 'string') {
      throw new Error('Invalid subject ID');
    }
    
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { subjectId },
      include: { teacher: true }
    });
    
    return Promise.all(
      teacherSubjects.map(ts => this.toDomain(ts.teacher))
    );
  }

  async findAvailableAt(timeSlotId: string): Promise<Teacher[]> {
    if (!timeSlotId || typeof timeSlotId !== 'string') {
      throw new Error('Invalid timeSlot ID');
    }
    
    const teacherTimeSlots = await prisma.teacherTimeSlot.findMany({
      where: { timeSlotId },
      include: { teacher: true }
    });
    
    return Promise.all(
      teacherTimeSlots.map(tts => this.toDomain(tts.teacher))
    );
  }

  async update(id: string, teacher: Teacher, subjectIds: string[], timeSlotIds: string[]): Promise<Teacher> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid teacher ID');
    }
    if (!subjectIds || subjectIds.length === 0) {
      throw new Error('Teacher must have at least one subject');
    }
    if (!timeSlotIds || timeSlotIds.length === 0) {
      throw new Error('Teacher must have at least one availability slot');
    }
    
    
    const updated = await prisma.$transaction(async (tx) => {
      
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          name: teacher.getName(),
        }
      });
      
      
      await tx.teacherSubject.deleteMany({
        where: { teacherId: id }
      });
      await tx.teacherTimeSlot.deleteMany({
        where: { teacherId: id }
      });
      
      
      await tx.teacherSubject.createMany({
        data: subjectIds.map(subjectId => ({
          teacherId: id,
          subjectId: subjectId
        }))
      });
      
      await tx.teacherTimeSlot.createMany({
        data: timeSlotIds.map(timeSlotId => ({
          teacherId: id,
          timeSlotId: timeSlotId
        }))
      });
      
      return updatedTeacher;
    });
    
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid teacher ID');
    }
    
    
    await prisma.teacher.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.teacher.count({
      where: { id },
    });
    return count > 0;
  }
}
