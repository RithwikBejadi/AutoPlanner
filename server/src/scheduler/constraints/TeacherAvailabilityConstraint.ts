import type { IConstraint, ConstraintContext, ConstraintResult } from './Constraint.js';

export class TeacherAvailabilityConstraint implements IConstraint {
  readonly name = 'TeacherAvailabilityConstraint';

  check(ctx: ConstraintContext): ConstraintResult {
    const available = ctx.teacher
      .getAvailability()
      .some(slot => slot.equals(ctx.timeSlot));

    if (available) {
      return { satisfied: true, constraintName: this.name };
    }

    return {
      satisfied: false,
      constraintName: this.name,
      reason:
        `Teacher '${ctx.teacher.getName()}' is not available at ` +
        `${ctx.timeSlot.toString()}`,
    };
  }
}
