import { TimeSlot } from '../../domain/entities/TimeSlot.js';
import { type ITimeSlotRepository } from '../interfaces/ITimeSlotRepository.js';
import prisma from '../../database/prisma.js';
import type { TimeSlot as PrismaTimeSlot } from '@prisma/client';

export class PrismaTimeSlotRepository implements ITimeSlotRepository {

  private toDomain(prismaTimeSlot: PrismaTimeSlot): TimeSlot {
    const startTime = this.parseTimeString(prismaTimeSlot.startTime);
    const endTime = this.parseTimeString(prismaTimeSlot.endTime);
    
    return new TimeSlot(
      prismaTimeSlot.day,
      startTime,
      endTime,
      prismaTimeSlot.id
    );
  }

  private toPrismaData(timeSlot: TimeSlot) {
    return {
      day: timeSlot.getDay(),
      startTime: this.formatTimeString(timeSlot.getStartTime()),
      endTime: this.formatTimeString(timeSlot.getEndTime()),
    };
  }

  private parseTimeString(timeStr: string): Date {
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    const hours = parseInt(parts[0]!, 10);
    const minutes = parseInt(parts[1]!, 10);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private formatTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async create(timeSlot: TimeSlot): Promise<TimeSlot> {
    const data = this.toPrismaData(timeSlot);
    const created = await prisma.timeSlot.create({ data });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<TimeSlot | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid timeSlot ID');
    }
    
    const found = await prisma.timeSlot.findUnique({
      where: { id },
    });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<TimeSlot[]> {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });
    return timeSlots.map(ts => this.toDomain(ts));
  }

  async findByDay(day: string): Promise<TimeSlot[]> {
    if (!day || typeof day !== 'string') {
      throw new Error('Invalid day');
    }
    
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      throw new Error(`Day must be one of: ${validDays.join(', ')}`);
    }
    
    const timeSlots = await prisma.timeSlot.findMany({
      where: { day },
      orderBy: { startTime: 'asc' }
    });
    return timeSlots.map(ts => this.toDomain(ts));
  }

  async findByDayAndTime(day: string, startTime: string, endTime: string): Promise<TimeSlot | null> {
    if (!day || typeof day !== 'string') {
      throw new Error('Invalid day');
    }
    if (!startTime || typeof startTime !== 'string') {
      throw new Error('Invalid start time');
    }
    if (!endTime || typeof endTime !== 'string') {
      throw new Error('Invalid end time');
    }
    
    const found = await prisma.timeSlot.findFirst({
      where: {
        day,
        startTime,
        endTime
      }
    });
    return found ? this.toDomain(found) : null;
  }

  async update(id: string, timeSlot: TimeSlot): Promise<TimeSlot> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid timeSlot ID');
    }
    
    const data = this.toPrismaData(timeSlot);
    const updated = await prisma.timeSlot.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid timeSlot ID');
    }
    
    await prisma.timeSlot.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.timeSlot.count({
      where: { id },
    });
    return count > 0;
  }
}
