import type {
  IConstraint,
  ConstraintContext,
  ConstraintResult,
} from "./Constraint.js";

export class TeacherConflictConstraint implements IConstraint {
  readonly name = "TeacherConflictConstraint";

  check(ctx: ConstraintContext): ConstraintResult {
    const conflict = ctx.scheduledEntries.find(
      (entry) =>
        entry.getTeacher().getId() === ctx.teacher.getId() &&
        entry.getTimeSlot().overlapsWith(ctx.timeSlot),
    );

    if (!conflict) {
      return { satisfied: true, constraintName: this.name };
    }

    return {
      satisfied: false,
      constraintName: this.name,
      reason:
        `Teacher '${ctx.teacher.getName()}' is already teaching ` +
        `'${conflict.getSubject().getName()}' at ${ctx.timeSlot.toString()}`,
    };
  }
}
