import type { ClassGroup } from "./ClassGroup.js";
import type { Subject } from "./Subject.js";

interface RoomInterface {
  getId(): string;
  getName(): string;
  getCapacity(): number;
  hasLabEquipment(): boolean;
  canAccommodate(studentCount: number): boolean;
  canHostSubject(subject: Subject): boolean;
  canHost(subject: Subject, classGroup: ClassGroup): boolean;
}

export class Room implements RoomInterface {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _capacity: number;
  private readonly _hasLabEquipment: boolean;

  constructor(
    id: string,
    name: string,
    capacity: number,
    hasLabEquipment: boolean,
  ) {
    if (!id || id.trim() === "") {
      throw new Error("Room ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("Room name cannot be empty");
    }
    if (capacity <= 0) {
      throw new Error("Room capacity must be greater than 0");
    }

    this._id = id;
    this._name = name;
    this._capacity = capacity;
    this._hasLabEquipment = hasLabEquipment;
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getCapacity(): number {
    return this._capacity;
  }

  hasLabEquipment(): boolean {
    return this._hasLabEquipment;
  }

  canAccommodate(studentCount: number): boolean {
    if (studentCount < 0) {
      throw new Error("Student count cannot be negative");
    }
    return this._capacity >= studentCount;
  }

  canHostSubject(subject: Subject): boolean {
    if (subject.requiresLab() && !this._hasLabEquipment) {
      return false;
    }
    return true;
  }

  canHost(subject: Subject, classGroup: ClassGroup): boolean {
    return (
      this.canAccommodate(classGroup.getStudentCount()) &&
      this.canHostSubject(subject)
    );
  }
}
