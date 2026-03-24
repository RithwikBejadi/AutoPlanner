import { type Request, type Response } from 'express';
import { PrismaTimetableRepository } from '../repositories/implementations/PrismaTimetableRepository.js';
import { PrismaTeacherRepository } from '../repositories/implementations/PrismaTeacherRepository.js';
import { PrismaRoomRepository } from '../repositories/implementations/PrismaRoomRepository.js';
import { PrismaSubjectRepository } from '../repositories/implementations/PrismaSubjectRepository.js';
import { PrismaClassGroupRepository } from '../repositories/implementations/PrismaClassGroupRepository.js';
import { PrismaTimeSlotRepository } from '../repositories/implementations/PrismaTimeSlotRepository.js';
import { SchedulerEngine } from '../scheduler/engine/SchedulerEngine.js';

const timetableRepo    = new PrismaTimetableRepository();
const teacherRepo      = new PrismaTeacherRepository();
const roomRepo         = new PrismaRoomRepository();
const subjectRepo      = new PrismaSubjectRepository();
const classGroupRepo   = new PrismaClassGroupRepository();
const timeSlotRepo     = new PrismaTimeSlotRepository();
const schedulerEngine  = new SchedulerEngine();



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
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: entry.getId(),
    teacher:    { id: entry.getTeacher().getId(),    name: entry.getTeacher().getName() },
    room:       { id: entry.getRoom().getId(),       name: entry.getRoom().getName() },
    subject:    { id: entry.getSubject().getId(),    name: entry.getSubject().getName(), code: entry.getSubject().getCode() },
    classGroup: { id: entry.getClassGroup().getId(), name: entry.getClassGroup().getName() },
    timeSlot: {
      day:       entry.getTimeSlot().getDay(),
      startTime: fmt(entry.getTimeSlot().getStartTime()),
      endTime:   fmt(entry.getTimeSlot().getEndTime()),
    },
  };
}



export class TimetableController {

    async generate(req: Request, res: Response): Promise<void> {
    try {
      
      const [teachers, rooms, subjects, classGroups, timeSlots] =
        await Promise.all([
          teacherRepo.findAll(),
          roomRepo.findAll(),
          subjectRepo.findAll(),
          classGroupRepo.findAll(),
          timeSlotRepo.findAll(),
        ]);

      
      const result = schedulerEngine.generate({
        teachers,
        rooms,
        subjects,
        classGroups,
        timeSlots,
      });

      
      const saved = await timetableRepo.create(result.timetable);

      
      res.status(201).json({
        success: true,
        data: {
          id:           saved.getId(),
          createdAt:    saved.getCreatedAt(),
          updatedAt:    saved.getUpdatedAt(),
          entries:      result.timetable.getEntries().map(serializeEntry),
          stats:        result.stats,
          isValid:      result.isValid,
          unscheduled:  result.unscheduledTasks,
        },
        message: result.isValid
          ? `Timetable generated successfully (${result.stats.scheduledCount}/${result.stats.totalTasks} sessions scheduled)`
          : `Timetable generated with ${result.stats.unscheduledCount} unscheduled session(s)`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:   'Failed to generate timetable',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    async getLatest(_req: Request, res: Response): Promise<void> {
    try {
      const timetable = await timetableRepo.findLatest();

      if (!timetable) {
        res.status(404).json({ success: false, error: 'No timetable found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id:         timetable.getId(),
          createdAt:  timetable.getCreatedAt(),
          updatedAt:  timetable.getUpdatedAt(),
          entries:    timetable.getEntries().map(serializeEntry),
          isValid:    timetable.isValid(),
          entriesCount: timetable.getEntries().length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:   'Failed to fetch latest timetable',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Timetable ID is required' });
        return;
      }

      const timetable = await timetableRepo.findById(id);

      if (!timetable) {
        res.status(404).json({ success: false, error: 'Timetable not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id:           timetable.getId(),
          createdAt:    timetable.getCreatedAt(),
          updatedAt:    timetable.getUpdatedAt(),
          entries:      timetable.getEntries().map(serializeEntry),
          isValid:      timetable.isValid(),
          entriesCount: timetable.getEntries().length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:   'Failed to fetch timetable',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    async getEntriesByFilter(req: Request, res: Response): Promise<void> {
    try {
      const { timetableId, teacherId, classGroupId, roomId } = req.query;

      if (!timetableId || typeof timetableId !== 'string') {
        res.status(400).json({ success: false, error: 'timetableId query param is required' });
        return;
      }

      let entries;
      if (teacherId && typeof teacherId === 'string') {
        entries = await timetableRepo.findEntriesByTeacher(timetableId, teacherId);
      } else if (classGroupId && typeof classGroupId === 'string') {
        entries = await timetableRepo.findEntriesByClassGroup(timetableId, classGroupId);
      } else if (roomId && typeof roomId === 'string') {
        entries = await timetableRepo.findEntriesByRoom(timetableId, roomId);
      } else {
        entries = await timetableRepo.findEntriesByTimetable(timetableId);
      }

      res.json({
        success: true,
        data:    entries.map(serializeEntry),
        count:   entries.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:   'Failed to fetch timetable entries',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

    async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Timetable ID is required' });
        return;
      }

      const exists = await timetableRepo.exists(id);
      if (!exists) {
        res.status(404).json({ success: false, error: 'Timetable not found' });
        return;
      }

      await timetableRepo.delete(id);
      res.json({ success: true, message: 'Timetable deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:   'Failed to delete timetable',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const timetableController = new TimetableController();
