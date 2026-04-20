interface ClassGroupInterface {
  getId(): string;
  getName(): string;
  getStudentCount(): number;
  getSubjects(): string[];
  addSubject(subjectId: string): void;
}

export class ClassGroup implements ClassGroupInterface {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _studentCount: number;
  private _subjects: string[];

  constructor(
    id: string,
    name: string,
    studentCount: number,
    subjects: string[] = [],
  ) {
    if (!id || id.trim() === "") {
      throw new Error("ClassGroup ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("ClassGroup name cannot be empty");
    }
    if (studentCount <= 0) {
      throw new Error("Student count must be greater than 0");
    }

    this._id = id;
    this._name = name;
    this._studentCount = studentCount;
    this._subjects = [...subjects];
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getStudentCount(): number {
    return this._studentCount;
  }

  getSubjects(): string[] {
    return [...this._subjects];
  }

  addSubject(subjectId: string): void {
    if (!subjectId || subjectId.trim() === "") {
      throw new Error("Subject ID cannot be empty");
    }

    if (!this._subjects.includes(subjectId)) {
      this._subjects.push(subjectId);
    }
  }

  hasSubject(subjectId: string): boolean {
    return this._subjects.includes(subjectId);
  }

  getSubjectCount(): number {
    return this._subjects.length;
  }
}
