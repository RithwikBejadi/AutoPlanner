import { TimeSlot } from '../../domain/entities/TimeSlot.js';

export interface ITimeSlotRepository {
  create(timeSlot: TimeSlot): Promise<TimeSlot>;
  
  findById(id: string): Promise<TimeSlot | null>;
  findAll(): Promise<TimeSlot[]>;
  findByDay(day: string): Promise<TimeSlot[]>;
  findByDayAndTime(day: string, startTime: string, endTime: string): Promise<TimeSlot | null>;
  
  update(id: string, timeSlot: TimeSlot): Promise<TimeSlot>;
  
  delete(id: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
}
