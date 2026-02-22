export interface TimeSlotInterface {
  equals(other: TimeSlotInterface): boolean;
  overlapsWith(other: TimeSlotInterface): boolean;
  getStartTime(): Date;
  getEndTime(): Date;
  getDay(): string;
  toString(): string;
}

export class TimeSlot implements TimeSlotInterface {
  private readonly day: string;
  private readonly startTime: Date;
  private readonly endTime: Date;

  constructor(day: string, startTime: Date, endTime: Date) {
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }

    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  equals(other: TimeSlotInterface): boolean {
    return (
      this.day === other.getDay() &&
      this.startTime.getTime() === other.getStartTime().getTime() &&
      this.endTime.getTime() === other.getEndTime().getTime()
    );
  }

  overlapsWith(other: TimeSlotInterface): boolean {
    if (this.day !== other.getDay()) {
      return false;
    }

    return (
      this.startTime < other.getEndTime() && this.endTime > other.getStartTime()
    );
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date {
    return this.endTime;
  }

  getDay(): string {
    return this.day;
  }

  toString(): string {
    const format = (d: Date) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return `${this.day} ${format(this.startTime)} - ${format(this.endTime)}`;
  }
}
