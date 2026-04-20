import { randomUUID } from "crypto";
import { ScheduleEntry } from "../../domain/entities/ScheduleEntry.js";
import type { Teacher } from "../../domain/entities/Teacher.js";
import type { Room } from "../../domain/entities/Room.js";
import type { Subject } from "../../domain/entities/Subject.js";
import type { ClassGroup } from "../../domain/entities/ClassGroup.js";
import type { TimeSlot } from "../../domain/entities/TimeSlot.js";
import { ConstraintValidator } from "../validator/ConstraintValidator.js";
import type { ConstraintContext } from "../constraints/Constraint.js";

export interface SchedulingTask {
  readonly subject: Subject;
  readonly classGroup: ClassGroup;
  readonly sessionIndex: number;
}

export interface AllocationResult {
  readonly entry: ScheduleEntry | null;
  readonly failureReason?: string;
}

export class SlotAllocator {
  private readonly validator: ConstraintValidator;

  constructor(validator?: ConstraintValidator) {
    this.validator = validator ?? new ConstraintValidator();
  }

  allocate(
    task: SchedulingTask,
    teachers: Teacher[],
    rooms: Room[],
    timeSlots: TimeSlot[],
    scheduledEntries: ScheduleEntry[],
  ): AllocationResult {
    const { subject, classGroup } = task;

    const qualifiedTeachers = teachers.filter((t) =>
      t.isQualifiedFor(subject.getId()),
    );

    if (qualifiedTeachers.length === 0) {
      return {
        entry: null,
        failureReason: `No teacher is qualified to teach '${subject.getName()}'`,
      };
    }

    const suitableRooms = rooms.filter((r) => r.canHostSubject(subject));

    if (suitableRooms.length === 0) {
      return {
        entry: null,
        failureReason: `No room can host subject '${subject.getName()}' (lab required: ${subject.requiresLab()})`,
      };
    }

    let lastReason: string | undefined;

    for (const timeSlot of timeSlots) {
      for (const teacher of qualifiedTeachers) {
        for (const room of suitableRooms) {
          const ctx: ConstraintContext = {
            scheduledEntries,
            teacher,
            room,
            subject,
            classGroup,
            timeSlot,
          };

          const result = this.validator.validate(ctx, true);

          if (result.valid) {
            try {
              const entry = new ScheduleEntry(
                randomUUID(),
                teacher,
                room,
                subject,
                classGroup,
                timeSlot,
              );
              return { entry };
            } catch (err) {
              lastReason =
                err instanceof Error
                  ? err.message
                  : "ScheduleEntry validation failed";
            }
          } else {
            lastReason = result.violations[0]?.reason ?? "Constraint violated";
          }
        }
      }
    }

    return {
      entry: null,
      failureReason:
        lastReason ??
        `Could not find a valid slot for '${subject.getName()}' / '${classGroup.getName()}'`,
    };
  }
}
