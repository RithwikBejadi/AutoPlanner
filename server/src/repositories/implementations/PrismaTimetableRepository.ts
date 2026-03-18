import { Timetable } from '../../domain/entities/Timetable.js';
import { ScheduleEntry } from '../../domain/entities/ScheduleEntry.js';
import { Teacher } from '../../domain/entities/Teacher.js';
import { Room } from '../../domain/entities/Room.js';
import { Subject } from '../../domain/entities/Subject.js';
import { ClassGroup } from '../../domain/entities/ClassGroup.js';
import { TimeSlot } from '../../domain/entities/TimeSlot.js';
import { type ITimetableRepository } from '../interfaces/ITimetableRepository.js';
import prisma from '../../database/prisma.js';
import type { Timetable as PrismaTimetable, ScheduleEntry as PrismaScheduleEntry } from '@prisma/client';

export class PrismaTimetableRepository implements ITimetableRepository {

  private async toDomain(prismaTimetable: PrismaTimetable): Promise<Timetable> {
    const timetable = new Timetable(
      prismaTimetable.id,
      prismaTimetable.createdAt,
      prismaTimetable.updatedAt
    );
    
    
    const entries = await this.findEntriesByTimetable(prismaTimetable.id);
    
    
    for (const entry of entries) {
      try {
        timetable.addEntry(entry);
      } catch (error) {
        
        console.warn(`Warning: Could not add entry ${entry.getId()} to timetable: ${error}`);
      }
    }
    
    return timetable;
  }

  private async scheduleEntryToDomain(prismaEntry: any): Promise<ScheduleEntry> {
    
    const teacher = await this.buildTeacherDomain(prismaEntry.teacher);
    const room = this.buildRoomDomain(prismaEntry.room);
    const subject = this.buildSubjectDomain(prismaEntry.subject);
    const classGroup = this.buildClassGroupDomain(prismaEntry.classGroup);
    const timeSlot = this.buildTimeSlotDomain(prismaEntry.timeSlot);
    
    return new ScheduleEntry(
      prismaEntry.id,
      teacher,
      room,
      subject,
      classGroup,
      timeSlot
    );
  }

  private async buildTeacherDomain(prismaTeacher: any): Promise<Teacher> {
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
      this.buildTimeSlotDomain(tts.timeSlot)
    );
    
    return new Teacher(
      prismaTeacher.id,
      prismaTeacher.name,
      subjectIds,
      availability
    );
  }

  private buildRoomDomain(prismaRoom: any): Room {
    return new Room(
      prismaRoom.id,
      prismaRoom.name,
      prismaRoom.capacity,
      prismaRoom.hasLabEquipment
    );
  }

  private buildSubjectDomain(prismaSubject: any): Subject {
    return new Subject(
      prismaSubject.id,
      prismaSubject.name,
      prismaSubject.code,
      prismaSubject.hoursPerWeek,
      prismaSubject.requiresLab,
      prismaSubject.maxSessionsPerDay
    );
  }

  private buildClassGroupDomain(prismaClassGroup: any): ClassGroup {
    return new ClassGroup(
      prismaClassGroup.id,
      prismaClassGroup.name,
      prismaClassGroup.studentCount,
      []
    );
  }

  private buildTimeSlotDomain(prismaTimeSlot: any): TimeSlot {
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

  async create(timetable: Timetable): Promise<Timetable> {
    const created = await prisma.timetable.create({
      data: {
        id: timetable.getId(),
        createdAt: timetable.getCreatedAt(),
        updatedAt: timetable.getUpdatedAt(),
      }
    });
    
    
    const entries = timetable.getEntries();
    if (entries.length > 0) {
      await prisma.$transaction(
        entries.map(entry => {
          const timeSlotId = entry.getTimeSlot().getId();
          if (!timeSlotId) throw new Error('TimeSlot is missing its database ID – cannot persist ScheduleEntry');
          return prisma.scheduleEntry.create({
            data: {
              id: entry.getId(),
              timetableId: timetable.getId(),
              teacherId: entry.getTeacher().getId(),
              roomId: entry.getRoom().getId(),
              subjectId: entry.getSubject().getId(),
              classGroupId: entry.getClassGroup().getId(),
              timeSlotId,
            }
          });
        })
      );
    }
    
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Timetable | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    
    const found = await prisma.timetable.findUnique({
      where: { id },
    });
    
    return found ? this.toDomain(found) : null;
  }

  async findLatest(): Promise<Timetable | null> {
    const found = await prisma.timetable.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Timetable[]> {
    const timetables = await prisma.timetable.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return Promise.all(timetables.map(t => this.toDomain(t)));
  }

  async addEntry(timetableId: string, entry: ScheduleEntry): Promise<void> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    
    await prisma.scheduleEntry.create({
      data: {
        id: entry.getId(),
        timetableId: timetableId,
        teacherId: entry.getTeacher().getId(),
        roomId: entry.getRoom().getId(),
        subjectId: entry.getSubject().getId(),
        classGroupId: entry.getClassGroup().getId(),
        timeSlotId: (() => {
          const id = entry.getTimeSlot().getId();
          if (!id) throw new Error('TimeSlot is missing its database ID');
          return id;
        })(),
      }
    });
    
    
    await prisma.timetable.update({
      where: { id: timetableId },
      data: { updatedAt: new Date() }
    });
  }

  async removeEntry(timetableId: string, entryId: string): Promise<void> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    if (!entryId || typeof entryId !== 'string') {
      throw new Error('Invalid entry ID');
    }
    
    await prisma.scheduleEntry.delete({
      where: { id: entryId }
    });
    
    
    await prisma.timetable.update({
      where: { id: timetableId },
      data: { updatedAt: new Date() }
    });
  }

  async clearEntries(timetableId: string): Promise<void> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    
    await prisma.scheduleEntry.deleteMany({
      where: { timetableId }
    });
    
    
    await prisma.timetable.update({
      where: { id: timetableId },
      data: { updatedAt: new Date() }
    });
  }

  async findEntriesByTimetable(timetableId: string): Promise<ScheduleEntry[]> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    
    const entries = await prisma.scheduleEntry.findMany({
      where: { timetableId },
      include: {
        teacher: true,
        room: true,
        subject: true,
        classGroup: true,
        timeSlot: true
      }
    });
    
    return Promise.all(entries.map(e => this.scheduleEntryToDomain(e)));
  }

  async findEntriesByTeacher(timetableId: string, teacherId: string): Promise<ScheduleEntry[]> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    if (!teacherId || typeof teacherId !== 'string') {
      throw new Error('Invalid teacher ID');
    }
    
    const entries = await prisma.scheduleEntry.findMany({
      where: {
        timetableId,
        teacherId
      },
      include: {
        teacher: true,
        room: true,
        subject: true,
        classGroup: true,
        timeSlot: true
      }
    });
    
    return Promise.all(entries.map(e => this.scheduleEntryToDomain(e)));
  }

  async findEntriesByClassGroup(timetableId: string, classGroupId: string): Promise<ScheduleEntry[]> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    if (!classGroupId || typeof classGroupId !== 'string') {
      throw new Error('Invalid classGroup ID');
    }
    
    const entries = await prisma.scheduleEntry.findMany({
      where: {
        timetableId,
        classGroupId
      },
      include: {
        teacher: true,
        room: true,
        subject: true,
        classGroup: true,
        timeSlot: true
      }
    });
    
    return Promise.all(entries.map(e => this.scheduleEntryToDomain(e)));
  }

  async findEntriesByRoom(timetableId: string, roomId: string): Promise<ScheduleEntry[]> {
    if (!timetableId || typeof timetableId !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('Invalid room ID');
    }
    
    const entries = await prisma.scheduleEntry.findMany({
      where: {
        timetableId,
        roomId
      },
      include: {
        teacher: true,
        room: true,
        subject: true,
        classGroup: true,
        timeSlot: true
      }
    });
    
    return Promise.all(entries.map(e => this.scheduleEntryToDomain(e)));
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid timetable ID');
    }
    
    
    await prisma.timetable.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.timetable.count({
      where: { id },
    });
    return count > 0;
  }
}
