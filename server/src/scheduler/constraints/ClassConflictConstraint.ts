import type {
  IConstraint,
  ConstraintContext,
  ConstraintResult,
} from "./Constraint.js";

export class ClassConflictConstraint implements IConstraint {
  readonly name = "ClassConflictConstraint";

  check(ctx: ConstraintContext): ConstraintResult {
    const concurrentConflict = ctx.scheduledEntries.find(
      (entry) =>
        entry.getClassGroup().getId() === ctx.classGroup.getId() &&
        entry.getTimeSlot().overlapsWith(ctx.timeSlot),
    );

    if (concurrentConflict) {
      return {
        satisfied: false,
        constraintName: this.name,
        reason:
          `Class '${ctx.classGroup.getName()}' already has a session of ` +
          `'${concurrentConflict.getSubject().getName()}' at ${ctx.timeSlot.toString()}`,
      };
    }

    const day = ctx.timeSlot.getDay();
    const sessionsToday = ctx.scheduledEntries.filter(
      (entry) =>
        entry.getClassGroup().getId() === ctx.classGroup.getId() &&
        entry.getSubject().getId() === ctx.subject.getId() &&
        entry.getTimeSlot().getDay() === day,
    ).length;

    if (sessionsToday >= ctx.subject.getMaxSessionsPerDay()) {
      return {
        satisfied: false,
        constraintName: this.name,
        reason:
          `Class '${ctx.classGroup.getName()}' already has ` +
          `${sessionsToday} session(s) of '${ctx.subject.getName()}' on ${day} ` +
          `(max: ${ctx.subject.getMaxSessionsPerDay()})`,
      };
    }

    return { satisfied: true, constraintName: this.name };
  }
}
