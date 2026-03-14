import { TimeSlot } from "./TimeSlot.js";
import type { ScheduleEntry } from "./ScheduleEntry.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface TimetableInterface {
  getId(): string;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  getEntries(): ScheduleEntry[];
  addEntry(entry: ScheduleEntry): void;
  removeEntry(entryId: string): void;
  findEntriesByTeacher(teacherId: string): ScheduleEntry[];
  findEntriesByClassGroup(classGroupId: string): ScheduleEntry[];
  findEntriesByRoom(roomId: string): ScheduleEntry[];
  findEntriesBySubject(subjectId: string): ScheduleEntry[];
  findEntriesByRoomAndTimeSlot(roomId: string, timeSlot: TimeSlot): ScheduleEntry[];
  hasConflicts(): boolean;
  isValid(): boolean;
  clear(): void;
}

export class Timetable implements TimetableInterface {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _entries: ScheduleEntry[];

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    if (!id || id.trim() === "") {
      throw new Error("Timetable ID cannot be empty");
    }
    const trimmedId = id.trim();
    if (!UUID_REGEX.test(trimmedId)) {
      throw new Error("Timetable ID must be a valid UUID");
    }

    this._id = trimmedId;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._entries = [];
  }

  getId(): string {
    return this._id;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  getEntries(): ScheduleEntry[] {
    return [...this._entries];
  }

  addEntry(entry: ScheduleEntry): void {
    if (!entry) {
      throw new Error("ScheduleEntry cannot be null");
    }

    
    const conflictMessage = this.getConflictMessage(entry);
    if (conflictMessage) {
      throw new Error(conflictMessage);
    }

    this._entries.push(entry);
    this._updatedAt = new Date();
  }

  removeEntry(entryId: string): void {
    const beforeLength = this._entries.length;
    this._entries = this._entries.filter(entry => entry.getId() !== entryId);
    
    
    if (this._entries.length !== beforeLength) {
      this._updatedAt = new Date();
    }
  }

  findEntriesByTeacher(teacherId: string): ScheduleEntry[] {
    return this._entries.filter(entry => entry.getTeacher().getId() === teacherId);
  }

  findEntriesByClassGroup(classGroupId: string): ScheduleEntry[] {
    return this._entries.filter(entry => entry.getClassGroup().getId() === classGroupId);
  }

  findEntriesByRoom(roomId: string): ScheduleEntry[] {
    return this._entries.filter(entry => entry.getRoom().getId() === roomId);
  }

  findEntriesBySubject(subjectId: string): ScheduleEntry[] {
    return this._entries.filter(entry => entry.getSubject().getId() === subjectId);
  }

  findEntriesByRoomAndTimeSlot(roomId: string, timeSlot: TimeSlot): ScheduleEntry[] {
    return this._entries.filter(entry => 
      entry.getRoom().getId() === roomId && entry.getTimeSlot().equals(timeSlot)
    );
  }

  hasConflicts(): boolean {
    for (let i = 0; i < this._entries.length; i++) {
      for (let j = i + 1; j < this._entries.length; j++) {
        const entryA = this._entries[i];
        const entryB = this._entries[j];

        if (!entryA || !entryB) continue;

        if (
          entryA.getTeacher().getId() === entryB.getTeacher().getId() &&
          entryA.getTimeSlot().overlapsWith(entryB.getTimeSlot())
        ) {
          return true;
        }

        if (
          entryA.getRoom().getId() === entryB.getRoom().getId() &&
          entryA.getTimeSlot().overlapsWith(entryB.getTimeSlot())
        ) {
          return true;
        }

        if (
          entryA.getClassGroup().getId() === entryB.getClassGroup().getId() &&
          entryA.getTimeSlot().overlapsWith(entryB.getTimeSlot())
        ) {
          return true;
        }
      }
    }
    return false;
  }

  isValid(): boolean {
    return !this.hasConflicts() && !this.hasMaxSessionsViolations();
  }

  clear(): void {
    this._entries = [];
    this._updatedAt = new Date();
  }

  private getConflictMessage(newEntry: ScheduleEntry): string | null {
    for (const existing of this._entries) {
      const timeOverlap = existing.getTimeSlot().overlapsWith(newEntry.getTimeSlot());
      if (!timeOverlap) continue;

      const time = newEntry.getTimeSlot().toString();

      if (existing.getTeacher().getId() === newEntry.getTeacher().getId()) {
        return `Cannot add entry: Teacher '${newEntry.getTeacher().getName()}' is already scheduled at ${time}`;
      }

      if (existing.getRoom().getId() === newEntry.getRoom().getId()) {
        return `Cannot add entry: Room '${newEntry.getRoom().getName()}' is already occupied at ${time}`;
      }

      if (existing.getClassGroup().getId() === newEntry.getClassGroup().getId()) {
        return `Cannot add entry: Class '${newEntry.getClassGroup().getName()}' already has a session at ${time}`;
      }
    }

    if (this.violatesMaxSessionsPerDay(newEntry)) {
      const subject = newEntry.getSubject();
      const classGroup = newEntry.getClassGroup();
      const currentCount = this.countSessionsForSubjectAndClassOnDay(
        subject.getId(),
        classGroup.getId(),
        newEntry.getTimeSlot().getDay()
      );
      return `Cannot add entry: Class '${classGroup.getName()}' already has ${currentCount} session(s) of '${subject.getName()}' today (max: ${subject.getMaxSessionsPerDay()})`;
    }

    return null;
  }

  private violatesMaxSessionsPerDay(newEntry: ScheduleEntry): boolean {
    const subject = newEntry.getSubject();
    const classGroup = newEntry.getClassGroup();
    const day = newEntry.getTimeSlot().getDay();

    const sessionsToday = this.countSessionsForSubjectAndClassOnDay(
      subject.getId(),
      classGroup.getId(),
      day
    );

    return sessionsToday >= subject.getMaxSessionsPerDay();
  }

  private countSessionsForSubjectAndClassOnDay(
    subjectId: string,
    classGroupId: string,
    day: string
  ): number {
    return this._entries.filter(entry =>
      entry.getSubject().getId() === subjectId &&
      entry.getClassGroup().getId() === classGroupId &&
      entry.getTimeSlot().getDay() === day
    ).length;
  }

  private hasMaxSessionsViolations(): boolean {
    const sessionsMap = new Map<string, number>();

    for (const entry of this._entries) {
      const key = `${entry.getSubject().getId()}-${entry.getClassGroup().getId()}-${entry.getTimeSlot().getDay()}`;
      sessionsMap.set(key, (sessionsMap.get(key) || 0) + 1);

      if (sessionsMap.get(key)! > entry.getSubject().getMaxSessionsPerDay()) {
        return true;
      }
    }

    return false;
  }
}
