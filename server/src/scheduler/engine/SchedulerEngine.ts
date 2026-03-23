import { randomUUID } from 'crypto';
import { Timetable } from '../../domain/entities/Timetable.js';
import type { Teacher } from '../../domain/entities/Teacher.js';
import type { Room } from '../../domain/entities/Room.js';
import type { Subject } from '../../domain/entities/Subject.js';
import type { ClassGroup } from '../../domain/entities/ClassGroup.js';
import type { TimeSlot } from '../../domain/entities/TimeSlot.js';
import type { ScheduleEntry } from '../../domain/entities/ScheduleEntry.js';
import { SlotAllocator, type SchedulingTask } from './SlotAllocator.js';
import { ConstraintValidator } from '../validator/ConstraintValidator.js';

export interface SchedulerInput {
  readonly teachers: Teacher[];
  readonly rooms: Room[];
  readonly subjects: Subject[];
  readonly classGroups: ClassGroup[];
  readonly timeSlots: TimeSlot[];
}

export interface SchedulingStats {
  readonly totalTasks: number;
  readonly scheduledCount: number;
  readonly unscheduledCount: number;
    readonly completionRate: number;
  readonly durationMs: number;
}

export interface SchedulerResult {
  readonly timetable: Timetable;
  readonly stats: SchedulingStats;
    readonly unscheduledTasks: Array<{
    subject: string;
    classGroup: string;
    sessionIndex: number;
    reason: string;
  }>;
    readonly isValid: boolean;
}

export class SchedulerEngine {
  private readonly allocator: SlotAllocator;
  private readonly validator: ConstraintValidator;

  constructor(validator?: ConstraintValidator) {
    this.validator = validator ?? new ConstraintValidator();
    this.allocator = new SlotAllocator(this.validator);
  }

    generate(input: SchedulerInput): SchedulerResult {
    this.validateInput(input);

    const startMs = Date.now();
    const timetable = new Timetable(randomUUID());

    
    const tasks = this.buildWorkList(input);

    const scheduledEntries: ScheduleEntry[] = [];
    const unscheduledTasks: SchedulerResult['unscheduledTasks'] = [];

    for (const task of tasks) {
      const result = this.allocator.allocate(
        task,
        input.teachers,
        input.rooms,
        input.timeSlots,
        scheduledEntries,
      );

      if (result.entry) {
        
        const entry = result.entry;
        try {
          timetable.addEntry(entry);
          scheduledEntries.push(entry);
        } catch (err) {
          
          unscheduledTasks.push({
            subject: task.subject.getName(),
            classGroup: task.classGroup.getName(),
            sessionIndex: task.sessionIndex,
            reason:
              err instanceof Error
                ? err.message
                : 'Failed to add entry to timetable',
          });
        }
      } else {
        unscheduledTasks.push({
          subject: task.subject.getName(),
          classGroup: task.classGroup.getName(),
          sessionIndex: task.sessionIndex,
          reason: result.failureReason ?? 'Unknown failure',
        });
      }
    }

    const durationMs = Date.now() - startMs;
    const totalTasks = tasks.length;
    const scheduledCount = scheduledEntries.length;
    const unscheduledCount = unscheduledTasks.length;

    return {
      timetable,
      stats: {
        totalTasks,
        scheduledCount,
        unscheduledCount,
        completionRate:
          totalTasks === 0
            ? 100
            : Math.round((scheduledCount / totalTasks) * 100),
        durationMs,
      },
      unscheduledTasks,
      isValid: timetable.isValid(),
    };
  }

  

    private buildWorkList(input: SchedulerInput): SchedulingTask[] {
    const tasks: SchedulingTask[] = [];

    for (const classGroup of input.classGroups) {
      
      const subjectIds = classGroup.getSubjects();

      const groupSubjects =
        subjectIds.length > 0
          ? input.subjects.filter(s => subjectIds.includes(s.getId()))
          : input.subjects; 

      for (const subject of groupSubjects) {
        const hours = subject.getHoursPerWeek();
        for (let i = 0; i < hours; i++) {
          tasks.push({ subject, classGroup, sessionIndex: i });
        }
      }
    }

    
    tasks.sort((a, b) => {
      
      if (a.subject.requiresLab() !== b.subject.requiresLab()) {
        return a.subject.requiresLab() ? -1 : 1;
      }
      
      if (b.subject.getHoursPerWeek() !== a.subject.getHoursPerWeek()) {
        return b.subject.getHoursPerWeek() - a.subject.getHoursPerWeek();
      }
      
      return (
        b.classGroup.getStudentCount() - a.classGroup.getStudentCount()
      );
    });

    return tasks;
  }

    private validateInput(input: SchedulerInput): void {
    if (!input.teachers || input.teachers.length === 0) {
      throw new Error('Cannot generate timetable: no teachers provided');
    }
    if (!input.rooms || input.rooms.length === 0) {
      throw new Error('Cannot generate timetable: no rooms provided');
    }
    if (!input.subjects || input.subjects.length === 0) {
      throw new Error('Cannot generate timetable: no subjects provided');
    }
    if (!input.classGroups || input.classGroups.length === 0) {
      throw new Error('Cannot generate timetable: no class groups provided');
    }
    if (!input.timeSlots || input.timeSlots.length === 0) {
      throw new Error('Cannot generate timetable: no time slots provided');
    }
  }
}
