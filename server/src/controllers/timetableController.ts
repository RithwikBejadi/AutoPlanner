import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { PrismaTimetableRepository } from "../repositories/implementations/PrismaTimetableRepository.js";
import { PrismaTeacherRepository } from "../repositories/implementations/PrismaTeacherRepository.js";
import { PrismaRoomRepository } from "../repositories/implementations/PrismaRoomRepository.js";
import { PrismaSubjectRepository } from "../repositories/implementations/PrismaSubjectRepository.js";
import { PrismaClassGroupRepository } from "../repositories/implementations/PrismaClassGroupRepository.js";
import { PrismaTimeSlotRepository } from "../repositories/implementations/PrismaTimeSlotRepository.js";
import { SchedulerEngine } from "../scheduler/engine/SchedulerEngine.js";

const timetableRepo = new PrismaTimetableRepository();
const teacherRepo = new PrismaTeacherRepository();
const roomRepo = new PrismaRoomRepository();
const subjectRepo = new PrismaSubjectRepository();
const classGroupRepo = new PrismaClassGroupRepository();
const timeSlotRepo = new PrismaTimeSlotRepository();
const schedulerEngine = new SchedulerEngine();

interface GenerationIssue {
  code: string;
  message: string;
}

function serializeEntry(entry: {
  getId(): string;
  getTeacher(): { getId(): string; getName(): string };
  getRoom(): { getId(): string; getName(): string };
  getSubject(): { getId(): string; getName(): string; getCode(): string };
  getClassGroup(): { getId(): string; getName(): string };
  getTimeSlot(): {
    getDay(): string;
    getStartTime(): Date;
    getEndTime(): Date;
  };
}) {
  const fmt = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return {
    id: entry.getId(),
    teacher: {
      id: entry.getTeacher().getId(),
      name: entry.getTeacher().getName(),
    },
    room: { id: entry.getRoom().getId(), name: entry.getRoom().getName() },
    subject: {
      id: entry.getSubject().getId(),
      name: entry.getSubject().getName(),
      code: entry.getSubject().getCode(),
    },
    classGroup: {
      id: entry.getClassGroup().getId(),
      name: entry.getClassGroup().getName(),
    },
    timeSlot: {
      day: entry.getTimeSlot().getDay(),
      startTime: fmt(entry.getTimeSlot().getStartTime()),
      endTime: fmt(entry.getTimeSlot().getEndTime()),
    },
  };
}

export class TimetableController {
  private validateGenerationInputs(input: {
    teachers: Awaited<ReturnType<typeof teacherRepo.findAllByUserId>>;
    rooms: Awaited<ReturnType<typeof roomRepo.findAllByUserId>>;
    subjects: Awaited<ReturnType<typeof subjectRepo.findAllByUserId>>;
    classGroups: Awaited<ReturnType<typeof classGroupRepo.findAllByUserId>>;
    timeSlots: Awaited<ReturnType<typeof timeSlotRepo.findAllByUserId>>;
  }): GenerationIssue[] {
    const issues: GenerationIssue[] = [];
    const { teachers, rooms, subjects, classGroups, timeSlots } = input;

    if (teachers.length === 0) {
      issues.push({
        code: "NO_TEACHERS",
        message: "At least one teacher is required",
      });
    }
    if (rooms.length === 0) {
      issues.push({
        code: "NO_ROOMS",
        message: "At least one room is required",
      });
    }
    if (subjects.length === 0) {
      issues.push({
        code: "NO_SUBJECTS",
        message: "At least one subject is required",
      });
    }
    if (classGroups.length === 0) {
      issues.push({
        code: "NO_CLASS_GROUPS",
        message: "At least one class group is required",
      });
    }
    if (timeSlots.length === 0) {
      issues.push({
        code: "NO_TIME_SLOTS",
        message: "At least one time slot is required",
      });
    }

    const subjectIdSet = new Set(subjects.map((s) => s.getId()));

    const invalidTeacherSubjectLinks = teachers.filter((teacher) =>
      teacher
        .getQualifiedSubjects()
        .some((subjectId) => !subjectIdSet.has(subjectId)),
    );
    if (invalidTeacherSubjectLinks.length > 0) {
      issues.push({
        code: "INVALID_TEACHER_SUBJECT_LINKS",
        message: "Some teachers are linked to subjects that no longer exist",
      });
    }

    const subjectsWithoutTeacher = subjects.filter(
      (subject) =>
        !teachers.some((teacher) => teacher.isQualifiedFor(subject.getId())),
    );
    if (subjectsWithoutTeacher.length > 0) {
      const names = subjectsWithoutTeacher.map((s) => s.getCode()).join(", ");
      issues.push({
        code: "UNASSIGNED_SUBJECTS",
        message: `Assign at least one teacher to these subjects: ${names}`,
      });
    }

    const classGroupsWithoutRoom = classGroups.filter(
      (classGroup) =>
        !rooms.some((room) =>
          room.canAccommodate(classGroup.getStudentCount()),
        ),
    );
    if (classGroupsWithoutRoom.length > 0) {
      const names = classGroupsWithoutRoom.map((cg) => cg.getName()).join(", ");
      issues.push({
        code: "CLASS_GROUP_CAPACITY_MISMATCH",
        message: `No room can accommodate these class groups: ${names}`,
      });
    }

    const labSubjectsWithoutLabs = subjects.filter(
      (subject) =>
        subject.requiresLab() && !rooms.some((room) => room.hasLabEquipment()),
    );
    if (labSubjectsWithoutLabs.length > 0) {
      const names = labSubjectsWithoutLabs.map((s) => s.getCode()).join(", ");
      issues.push({
        code: "LAB_ROOMS_REQUIRED",
        message: `These lab subjects require at least one lab-enabled room: ${names}`,
      });
    }

    return issues;
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res
          .status(401)
          .json({ error: "Unauthorized", message: "User not authenticated" });
        return;
      }

      const timetables = await timetableRepo.findAllByUserId(userId);
      const data = timetables.map((t) => ({
        id: t.getId(),
        createdAt: t.getCreatedAt(),
        updatedAt: t.getUpdatedAt(),
        entryCount: t.getEntries().length,
      }));

      res.json({
        data: data.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
        ),
      });
    } catch (error) {
      console.error("Failed to fetch timetables", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const [teachers, rooms, subjects, classGroups, timeSlots] =
        await Promise.all([
          teacherRepo.findAllByUserId(userId),
          roomRepo.findAllByUserId(userId),
          subjectRepo.findAllByUserId(userId),
          classGroupRepo.findAllByUserId(userId),
          timeSlotRepo.findAllByUserId(userId),
        ]);

      const issues = this.validateGenerationInputs({
        teachers,
        rooms,
        subjects,
        classGroups,
        timeSlots,
      });

      if (issues.length > 0) {
        res.status(422).json({
          success: false,
          error: "Missing or invalid scheduling inputs",
          message:
            "Please complete the required setup before generating a timetable",
          details: issues,
        });
        return;
      }

      const result = schedulerEngine.generate({
        teachers,
        rooms,
        subjects,
        classGroups,
        timeSlots,
      });

      const saved = await timetableRepo.create(result.timetable, userId);

      res.status(201).json({
        success: true,
        data: {
          id: saved.getId(),
          createdAt: saved.getCreatedAt(),
          updatedAt: saved.getUpdatedAt(),
          entries: result.timetable.getEntries().map(serializeEntry),
          stats: result.stats,
          isValid: result.isValid,
          unscheduled: result.unscheduledTasks,
        },
        message: result.isValid
          ? `Timetable generated successfully (${result.stats.scheduledCount}/${result.stats.totalTasks} sessions scheduled)`
          : `Timetable generated with ${result.stats.unscheduledCount} unscheduled session(s)`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.startsWith("Cannot generate timetable")
        ? 422
        : 500;

      res.status(status).json({
        success: false,
        error: "Failed to generate timetable",
        message,
      });
    }
  }

  async getLatest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const timetable = await timetableRepo.findLatestByUserId(userId);

      if (!timetable) {
        res.status(404).json({ success: false, error: "No timetable found" });
        return;
      }

      res.json({
        success: true,
        data: {
          id: timetable.getId(),
          createdAt: timetable.getCreatedAt(),
          updatedAt: timetable.getUpdatedAt(),
          entries: timetable.getEntries().map(serializeEntry),
          isValid: timetable.isValid(),
          entriesCount: timetable.getEntries().length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch latest timetable",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== "string") {
        res
          .status(400)
          .json({ success: false, error: "Timetable ID is required" });
        return;
      }

      const timetable = await timetableRepo.findByIdAndUserId(id, userId);

      if (!timetable) {
        res.status(404).json({ success: false, error: "Timetable not found" });
        return;
      }

      res.json({
        success: true,
        data: {
          id: timetable.getId(),
          createdAt: timetable.getCreatedAt(),
          updatedAt: timetable.getUpdatedAt(),
          entries: timetable.getEntries().map(serializeEntry),
          isValid: timetable.isValid(),
          entriesCount: timetable.getEntries().length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch timetable",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getEntriesByFilter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { timetableId, teacherId, classGroupId, roomId } = req.query;
      const userId = req.user!.id;

      if (!timetableId || typeof timetableId !== "string") {
        res
          .status(400)
          .json({
            success: false,
            error: "timetableId query param is required",
          });
        return;
      }

      let entries;
      if (teacherId && typeof teacherId === "string") {
        entries = await timetableRepo.findEntriesByTeacher(
          timetableId,
          teacherId,
          userId,
        );
      } else if (classGroupId && typeof classGroupId === "string") {
        entries = await timetableRepo.findEntriesByClassGroup(
          timetableId,
          classGroupId,
          userId,
        );
      } else if (roomId && typeof roomId === "string") {
        entries = await timetableRepo.findEntriesByRoom(
          timetableId,
          roomId,
          userId,
        );
      } else {
        entries = await timetableRepo.findEntriesByTimetable(
          timetableId,
          userId,
        );
      }

      res.json({
        success: true,
        data: entries.map(serializeEntry),
        count: entries.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch timetable entries",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== "string") {
        res
          .status(400)
          .json({ success: false, error: "Timetable ID is required" });
        return;
      }

      const exists = await timetableRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: "Timetable not found" });
        return;
      }

      await timetableRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: "Timetable deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to delete timetable",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const timetableController = new TimetableController();
