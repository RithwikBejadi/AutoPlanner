import type { IConstraint, ConstraintContext, ConstraintResult } from './Constraint.js';

export class SubjectDailyLimitConstraint implements IConstraint {
  readonly name = 'SubjectDailyLimitConstraint';

  check(ctx: ConstraintContext): ConstraintResult {
    const maxPerDay = ctx.subject.getMaxSessionsPerDay();

    const sessionsAlreadyScheduledToday = ctx.scheduledEntries.filter((entry) =>
      entry.getClassGroup().getId() === ctx.classGroup.getId() &&
      entry.getSubject().getId() === ctx.subject.getId() &&
      entry.getTimeSlot().getDay() === ctx.timeSlot.getDay()
    ).length;

    if (sessionsAlreadyScheduledToday >= maxPerDay) {
      return {
        satisfied: false,
        constraintName: this.name,
        reason:
          `Subject '${ctx.subject.getCode()}' exceeds max sessions per day ` +
          `for class '${ctx.classGroup.getName()}' on ${ctx.timeSlot.getDay()}`,
      };
    }

    return { satisfied: true, constraintName: this.name };
  }
}
