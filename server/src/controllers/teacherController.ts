import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { PrismaTeacherRepository } from '../repositories/implementations/PrismaTeacherRepository.js';
import { Teacher } from '../domain/entities/Teacher.js';
import { TimeSlot } from '../domain/entities/TimeSlot.js';
import { randomUUID } from 'crypto';

const teacherRepo = new PrismaTeacherRepository();

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export class TeacherController {
  
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const teachers = await teacherRepo.findAllByUserId(userId);
      
      res.json({
        success: true,
        data: teachers.map(t => ({
          id: t.getId(),
          name: t.getName(),
          subjectIds: t.getQualifiedSubjects(),
          timeSlotIds: t.getAvailability().map(ts => ts.getId()).filter((id): id is string => Boolean(id)),
          availability: t.getAvailability().map(ts => ({
            id: ts.getId(),
            day: ts.getDay(),
            startTime: formatTime(ts.getStartTime()),
            endTime: formatTime(ts.getEndTime())
          }))
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teachers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Teacher ID is required'
        });
        return;
      }

      const teacher = await teacherRepo.findByIdAndUserId(id, userId);
      
      if (!teacher) {
        res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: teacher.getId(),
          name: teacher.getName(),
          subjectIds: teacher.getQualifiedSubjects(),
          timeSlotIds: teacher.getAvailability().map(ts => ts.getId()).filter((slotId): slotId is string => Boolean(slotId)),
          availability: teacher.getAvailability().map(ts => ({
            id: ts.getId(),
            day: ts.getDay(),
            startTime: formatTime(ts.getStartTime()),
            endTime: formatTime(ts.getEndTime())
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, subjectIds, timeSlotIds } = req.body;
      const userId = req.user!.id;

      if (!name || !subjectIds || !Array.isArray(subjectIds) || !timeSlotIds || !Array.isArray(timeSlotIds)) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, subjectIds (array), timeSlotIds (array)'
        });
        return;
      }

      const dummyTimeSlot = new TimeSlot('Monday', new Date(0, 0, 0, 9, 0), new Date(0, 0, 0, 10, 0));
      const teacher = new Teacher(
        randomUUID(),
        name,
        subjectIds,
        [dummyTimeSlot]
      );

      const created = await teacherRepo.create(teacher, subjectIds, timeSlotIds, userId);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          name: created.getName(),
          subjectIds: created.getQualifiedSubjects(),
          timeSlotIds: created.getAvailability().map(ts => ts.getId()).filter((slotId): slotId is string => Boolean(slotId)),
          availability: created.getAvailability().map(ts => ({
            id: ts.getId(),
            day: ts.getDay(),
            startTime: formatTime(ts.getStartTime()),
            endTime: formatTime(ts.getEndTime())
          }))
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create teacher',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, subjectIds, timeSlotIds } = req.body;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Teacher ID is required'
        });
        return;
      }

      if (!name || !subjectIds || !Array.isArray(subjectIds) || !timeSlotIds || !Array.isArray(timeSlotIds)) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, subjectIds (array), timeSlotIds (array)'
        });
        return;
      }

      const exists = await teacherRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
        return;
      }

      const dummyTimeSlot = new TimeSlot('Monday', new Date(0, 0, 0, 9, 0), new Date(0, 0, 0, 10, 0));
      const teacher = new Teacher(id, name, subjectIds, [dummyTimeSlot]);
      const updated = await teacherRepo.update(id, teacher, subjectIds, timeSlotIds, userId);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          name: updated.getName(),
          subjectIds: updated.getQualifiedSubjects(),
          timeSlotIds: updated.getAvailability().map(ts => ts.getId()).filter((slotId): slotId is string => Boolean(slotId)),
          availability: updated.getAvailability().map(ts => ({
            id: ts.getId(),
            day: ts.getDay(),
            startTime: formatTime(ts.getStartTime()),
            endTime: formatTime(ts.getEndTime())
          }))
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update teacher',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Teacher ID is required' });
        return;
      }

      const exists = await teacherRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: 'Teacher not found' });
        return;
      }

      await teacherRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete teacher',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const teacherController = new TeacherController();
