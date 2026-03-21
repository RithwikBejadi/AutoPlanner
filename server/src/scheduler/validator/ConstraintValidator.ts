import type { IConstraint, ConstraintContext, ConstraintResult } from '../constraints/Constraint.js';
import { TeacherAvailabilityConstraint } from '../constraints/TeacherAvailabilityConstraint.js';
import { TeacherConflictConstraint } from '../constraints/TeacherConflictConstraint.js';
import { RoomCapacityConstraint } from '../constraints/RoomCapacityConstraint.js';
import { RoomConflictConstraint } from '../constraints/RoomConflictConstraint.js';
import { ClassConflictConstraint } from '../constraints/ClassConflictConstraint.js';

export interface ValidationResult {
  readonly valid: boolean;
    readonly violations: ConstraintResult[];
    readonly results: ConstraintResult[];
}

export class ConstraintValidator {
  private readonly constraints: IConstraint[];

  constructor(extraConstraints: IConstraint[] = []) {
    
    this.constraints = [
      new TeacherAvailabilityConstraint(), 
      new TeacherConflictConstraint(),
      new RoomCapacityConstraint(),
      new RoomConflictConstraint(),
      new ClassConflictConstraint(),
      ...extraConstraints,
    ];
  }

    validate(ctx: ConstraintContext, failFast = true): ValidationResult {
    const results: ConstraintResult[] = [];
    const violations: ConstraintResult[] = [];

    for (const constraint of this.constraints) {
      const result = constraint.check(ctx);
      results.push(result);

      if (!result.satisfied) {
        violations.push(result);
        if (failFast) {
          
          return { valid: false, violations, results };
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      results,
    };
  }

    isValid(ctx: ConstraintContext): boolean {
    return this.validate(ctx, true).valid;
  }

    getConstraintNames(): string[] {
    return this.constraints.map(c => c.name);
  }
}
