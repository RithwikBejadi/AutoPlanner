import type { IConstraint, ConstraintContext, ConstraintResult } from './Constraint.js';

export class RoomConflictConstraint implements IConstraint {
  readonly name = 'RoomConflictConstraint';

  check(ctx: ConstraintContext): ConstraintResult {
    const conflict = ctx.scheduledEntries.find(
      entry =>
        entry.getRoom().getId() === ctx.room.getId() &&
        entry.getTimeSlot().overlapsWith(ctx.timeSlot),
    );

    if (!conflict) {
      return { satisfied: true, constraintName: this.name };
    }

    return {
      satisfied: false,
      constraintName: this.name,
      reason:
        `Room '${ctx.room.getName()}' is already occupied by ` +
        `'${conflict.getClassGroup().getName()}' at ${ctx.timeSlot.toString()}`,
    };
  }
}
