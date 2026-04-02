import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { PrismaTimeSlotRepository } from '../repositories/implementations/PrismaTimeSlotRepository.js';
import { TimeSlot } from '../domain/entities/TimeSlot.js';

const timeSlotRepo = new PrismaTimeSlotRepository();

export class TimeSlotController {
  
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const timeSlots = await timeSlotRepo.findAllByUserId(userId);
      
      res.json({
        success: true,
        data: timeSlots.map(ts => ({
          day: ts.getDay(),
          startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch time slots',
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
          error: 'TimeSlot ID is required'
        });
        return;
      }

      const timeSlot = await timeSlotRepo.findByIdAndUserId(id, userId);
      
      if (!timeSlot) {
        res.status(404).json({
          success: false,
          error: 'TimeSlot not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          day: timeSlot.getDay(),
          startTime: timeSlot.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: timeSlot.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch time slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getByDay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { day } = req.params;
      const userId = req.user!.id;
      
      if (!day || typeof day !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Day is required'
        });
        return;
      }

      const timeSlots = await timeSlotRepo.findByDay(day);

      res.json({
        success: true,
        data: timeSlots.map(ts => ({
          day: ts.getDay(),
          startTime: ts.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: ts.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch time slots by day',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { day, startTime, endTime } = req.body;
      const userId = req.user!.id;

      if (!day || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: day, startTime, endTime'
        });
        return;
      }

      const parseTime = (timeStr: string): Date => {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0] || '0', 10);
        const minutes = parseInt(parts[1] || '0', 10);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      const timeSlot = new TimeSlot(
        day,
        parseTime(startTime),
        parseTime(endTime)
      );

      const created = await timeSlotRepo.create(timeSlot, userId);

      res.status(201).json({
        success: true,
        data: {
          day: created.getDay(),
          startTime: created.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: created.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create time slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'TimeSlot ID is required' });
        return;
      }

      const exists = await timeSlotRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: 'TimeSlot not found' });
        return;
      }

      await timeSlotRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: 'TimeSlot deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete time slot',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const timeSlotController = new TimeSlotController();
