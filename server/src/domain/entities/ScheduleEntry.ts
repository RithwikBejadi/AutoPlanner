import { ClassGroup } from "./ClassGroup.js";
import { Room } from "./Room.js";
import { Subject } from "./Subject.js";
import { Teacher } from "./Teacher.js";
import { TimeSlot } from "./TimeSlot.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ScheduleEntryInterface {
  getId(): string;
  getTeacher(): Teacher;
  getRoom(): Room;
  getSubject(): Subject;
  getClassGroup(): ClassGroup;
  getTimeSlot(): TimeSlot;
  isValid(): boolean;
}

export class ScheduleEntry implements ScheduleEntryInterface {
  private readonly _id: string;
  private readonly _teacher: Teacher;
  private readonly _room: Room;
  private readonly _subject: Subject;
  private readonly _classGroup: ClassGroup;
  private readonly _timeSlot: TimeSlot;

  constructor(
    id: string,
    teacher: Teacher,
    room: Room,
    subject: Subject,
    classGroup: ClassGroup,
    timeSlot: TimeSlot,
  ) {
    if (!id || id.trim() === "") {
      throw new Error("ScheduleEntry ID cannot be empty");
    }
    const trimmedId = id.trim();
    if (!UUID_REGEX.test(trimmedId)) {
      throw new Error("ScheduleEntry ID must be a valid UUID");
    }

    if (!teacher) {
      throw new Error("Teacher cannot be null");
    }
    if (!room) {
      throw new Error("Room cannot be null");
    }
    if (!subject) {
      throw new Error("Subject cannot be null");
    }
    if (!classGroup) {
      throw new Error("ClassGroup cannot be null");
    }
    if (!timeSlot) {
      throw new Error("TimeSlot cannot be null");
    }

    if (!teacher.isQualifiedFor(subject.getId())) {
      throw new Error(
        `Teacher '${teacher.getName()}' is not qualified to teach '${subject.getName()}'`,
      );
    }

    if (!room.canHost(subject, classGroup)) {
      const reasons: string[] = [];
      if (!room.canAccommodate(classGroup.getStudentCount())) {
        reasons.push(
          `capacity ${room.getCapacity()} < ${classGroup.getStudentCount()} students`,
        );
      }
      if (subject.requiresLab() && !room.hasLabEquipment()) {
        reasons.push("lab equipment required but not available");
      }
      throw new Error(
        `Room '${room.getName()}' cannot host '${subject.getName()}' for '${classGroup.getName()}': ${reasons.join(", ")}`,
      );
    }

    const isAvailable = teacher
      .getAvailability()
      .some((slot) => slot.equals(timeSlot));
    if (!isAvailable) {
      throw new Error(
        `Teacher '${teacher.getName()}' is not available at ${timeSlot.toString()}`,
      );
    }

    this._id = trimmedId;
    this._teacher = teacher;
    this._room = room;
    this._subject = subject;
    this._classGroup = classGroup;
    this._timeSlot = timeSlot;
  }

  getId(): string {
    return this._id;
  }

  getTeacher(): Teacher {
    return this._teacher;
  }

  getRoom(): Room {
    return this._room;
  }

  getSubject(): Subject {
    return this._subject;
  }

  getClassGroup(): ClassGroup {
    return this._classGroup;
  }

  getTimeSlot(): TimeSlot {
    return this._timeSlot;
  }

  isValid(): boolean {
    return true;
  }
}
