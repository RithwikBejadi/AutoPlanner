import type { TimeSlot } from "./TimeSlot.js";

interface TeacherInterface {
  getId(): string;
  getName(): string;
  getQualifiedSubjects(): string[];
  isQualifiedFor(subjectId: string): boolean;
  getAvailability(): TimeSlot[];
}

export class Teacher implements TeacherInterface {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _subjectIds: string[];
  private _availability: TimeSlot[];

  constructor(
    id: string,
    name: string,
    qualifiedSubjects: string[],
    availability: TimeSlot[],
  ) {
    if (!id || id.trim() === "") {
      throw new Error("Teacher ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("Teacher name cannot be empty");
    }
    if (!qualifiedSubjects || qualifiedSubjects.length === 0) {
      throw new Error("Teacher must have at least one qualified subject");
    }
    if (qualifiedSubjects.some((id) => !id || id.trim() === "")) {
      throw new Error("Subject IDs cannot be empty");
    }
    
    if (!availability || availability.length === 0) {
      throw new Error("Teacher must have availability information");
    }

    this._id = id;
    this._name = name;
    this._subjectIds = [...qualifiedSubjects];
    this._availability = availability;
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getQualifiedSubjects(): string[] {
    return [...this._subjectIds];
  }

  isQualifiedFor(subjectId: string): boolean {
    return this._subjectIds.includes(subjectId);
  }

  getAvailability(): TimeSlot[] {
    return this._availability;
  }
}
