interface SubjectInterface {
  getId(): string;
  getName(): string;
  getCode(): string;
  getHoursPerWeek(): number;
  requiresLab(): boolean;
  getMaxSessionsPerDay(): number;
}

export class Subject implements SubjectInterface {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _code: string;
  private readonly _hoursPerWeek: number;
  private readonly _requiresLab: boolean;
  private readonly _maxSessionsPerDay: number;

  constructor(
    id: string,
    name: string,
    code: string,
    hoursPerWeek: number,
    requiresLab: boolean,
    maxSessionsPerDay: number,
  ) {
    if (hoursPerWeek <= 0) {
      throw new Error("Hours per week must be greater than 0");
    }
    if (maxSessionsPerDay <= 0) {
      throw new Error("Max sessions per day must be greater than 0");
    }
    if (!id || !name || !code) {
      throw new Error("ID, name, and code cannot be empty");
    }
    this._id = id;
    this._name = name;
    this._code = code;
    this._hoursPerWeek = hoursPerWeek;
    this._requiresLab = requiresLab;
    this._maxSessionsPerDay = maxSessionsPerDay;
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getCode(): string {
    return this._code;
  }

  getHoursPerWeek(): number {
    return this._hoursPerWeek;
  }

  requiresLab(): boolean {
    return this._requiresLab;
  }

  getMaxSessionsPerDay(): number {
    return this._maxSessionsPerDay;
  }
}
