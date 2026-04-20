import type {
  IConstraint,
  ConstraintContext,
  ConstraintResult,
} from "./Constraint.js";

export class RoomCapacityConstraint implements IConstraint {
  readonly name = "RoomCapacityConstraint";

  check(ctx: ConstraintContext): ConstraintResult {
    if (!ctx.room.canAccommodate(ctx.classGroup.getStudentCount())) {
      return {
        satisfied: false,
        constraintName: this.name,
        reason:
          `Room '${ctx.room.getName()}' has capacity ${ctx.room.getCapacity()} ` +
          `but class '${ctx.classGroup.getName()}' has ${ctx.classGroup.getStudentCount()} students`,
      };
    }

    if (ctx.subject.requiresLab() && !ctx.room.hasLabEquipment()) {
      return {
        satisfied: false,
        constraintName: this.name,
        reason:
          `Subject '${ctx.subject.getName()}' requires lab equipment, ` +
          `but room '${ctx.room.getName()}' does not have it`,
      };
    }

    return { satisfied: true, constraintName: this.name };
  }
}
