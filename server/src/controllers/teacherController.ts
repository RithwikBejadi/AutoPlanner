import { type Request, type Response } from 'express';
import { PrismaTeacherRepository } from '../repositories/implementations/PrismaTeacherRepository.js';
import { Teacher } from '../domain/entities/Teacher.js';
import { TimeSlot } from '../domain/entities/TimeSlot.js';
import { randomUUID } from 'crypto';

const teacherRepo = new PrismaTeacherRepository();

export class TeacherController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await teacherRepo.findAll();
      
      res.json({
        success: true,
        data: teachers.map(t => ({
          id: t.getId(),
          name: t.getName(),
          subjectIds: t.getQualifiedSubjects(),
          availability: t.getAvailability().map(ts => ({
            day: ts.getDay(),
            startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Teacher ID is required'
        });
        return;
      }

      const teacher = await teacherRepo.findById(id);
      
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
          availability: teacher.getAvailability().map(ts => ({
            day: ts.getDay(),
            startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, subjectIds, timeSlotIds } = req.body;

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

      const created = await teacherRepo.create(teacher, subjectIds, timeSlotIds);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          name: created.getName(),
          subjectIds: created.getQualifiedSubjects(),
          availability: created.getAvailability().map(ts => ({
            day: ts.getDay(),
            startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, subjectIds, timeSlotIds } = req.body;

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

      const exists = await teacherRepo.exists(id);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
        return;
      }

      const dummyTimeSlot = new TimeSlot('Monday', new Date(0, 0, 0, 9, 0), new Date(0, 0, 0, 10, 0));
      const teacher = new Teacher(id, name, subjectIds, [dummyTimeSlot]);
      const updated = await teacherRepo.update(id, teacher, subjectIds, timeSlotIds);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          name: updated.getName(),
          subjectIds: updated.getQualifiedSubjects(),
          availability: updated.getAvailability().map(ts => ({
            day: ts.getDay(),
            startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Teacher ID is required' });
        return;
      }

      const exists = await teacherRepo.exists(id);
      if (!exists) {
        res.status(404).json({ success: false, error: 'Teacher not found' });
        return;
      }

      await teacherRepo.delete(id);
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
