import { TimeSlot } from '../../domain/entities/TimeSlot.js';

export interface ITimeSlotRepository {
  create(timeSlot: TimeSlot, userId: string): Promise<TimeSlot>;
  
  findById(id: string): Promise<TimeSlot | null>;
  findAll(): Promise<TimeSlot[]>;
  findAllByUserId(userId: string): Promise<TimeSlot[]>;
  findByIdAndUserId(id: string, userId: string): Promise<TimeSlot | null>;
  findByDay(day: string): Promise<TimeSlot[]>;
  findByDayAndTime(day: string, startTime: string, endTime: string): Promise<TimeSlot | null>;
  
  update(id: string, timeSlot: TimeSlot): Promise<TimeSlot>;
  
  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
