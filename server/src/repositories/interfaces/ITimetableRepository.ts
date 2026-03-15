import { Timetable } from '../../domain/entities/Timetable.js';
import { ScheduleEntry } from '../../domain/entities/ScheduleEntry.js';

export interface ITimetableRepository {
  create(timetable: Timetable): Promise<Timetable>;
  
  findById(id: string): Promise<Timetable | null>;
  findLatest(): Promise<Timetable | null>;
  findAll(): Promise<Timetable[]>;
  
  addEntry(timetableId: string, entry: ScheduleEntry): Promise<void>;
  removeEntry(timetableId: string, entryId: string): Promise<void>;
  clearEntries(timetableId: string): Promise<void>;
  
  findEntriesByTimetable(timetableId: string): Promise<ScheduleEntry[]>;
  findEntriesByTeacher(timetableId: string, teacherId: string): Promise<ScheduleEntry[]>;
  findEntriesByClassGroup(timetableId: string, classGroupId: string): Promise<ScheduleEntry[]>;
  findEntriesByRoom(timetableId: string, roomId: string): Promise<ScheduleEntry[]>;
  
  delete(id: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
}
