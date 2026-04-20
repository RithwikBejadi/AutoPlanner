import type { ScheduleEntry } from "../../domain/entities/ScheduleEntry.js";
import type { Teacher } from "../../domain/entities/Teacher.js";
import type { Room } from "../../domain/entities/Room.js";
import type { Subject } from "../../domain/entities/Subject.js";
import type { ClassGroup } from "../../domain/entities/ClassGroup.js";
import type { TimeSlot } from "../../domain/entities/TimeSlot.js";

export interface ConstraintContext {
  readonly scheduledEntries: ReadonlyArray<ScheduleEntry>;
  readonly teacher: Teacher;
  readonly room: Room;
  readonly subject: Subject;
  readonly classGroup: ClassGroup;
  readonly timeSlot: TimeSlot;
}

export interface ConstraintResult {
  readonly satisfied: boolean;
  readonly reason?: string;
  readonly constraintName: string;
}

export interface IConstraint {
  readonly name: string;
  check(context: ConstraintContext): ConstraintResult;
}
