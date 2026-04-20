import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { PrismaTimeSlotRepository } from "../repositories/implementations/PrismaTimeSlotRepository.js";
import { TimeSlot } from "../domain/entities/TimeSlot.js";

const timeSlotRepo = new PrismaTimeSlotRepository();

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseTime = (timeStr: string): Date => {
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export class TimeSlotController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const timeSlots = await timeSlotRepo.findAllByUserId(userId);

      res.json({
        success: true,
        data: timeSlots.map((ts) => ({
          id: ts.getId(),
          day: ts.getDay(),
          startTime: formatTime(ts.getStartTime()),
          endTime: formatTime(ts.getEndTime()),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch time slots",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== "string") {
        res.status(400).json({
          success: false,
          error: "TimeSlot ID is required",
        });
        return;
      }

      const timeSlot = await timeSlotRepo.findByIdAndUserId(id, userId);

      if (!timeSlot) {
        res.status(404).json({
          success: false,
          error: "TimeSlot not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: timeSlot.getId(),
          day: timeSlot.getDay(),
          startTime: formatTime(timeSlot.getStartTime()),
          endTime: formatTime(timeSlot.getEndTime()),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch time slot",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getByDay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { day } = req.params;
      const userId = req.user!.id;

      if (!day || typeof day !== "string") {
        res.status(400).json({
          success: false,
          error: "Day is required",
        });
        return;
      }

      const timeSlots = (await timeSlotRepo.findAllByUserId(userId)).filter(
        (ts) => ts.getDay() === day,
      );

      res.json({
        success: true,
        data: timeSlots.map((ts) => ({
          id: ts.getId(),
          day: ts.getDay(),
          startTime: formatTime(ts.getStartTime()),
          endTime: formatTime(ts.getEndTime()),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch time slots by day",
        message: error instanceof Error ? error.message : "Unknown error",
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
          error: "Missing required fields: day, startTime, endTime",
        });
        return;
      }

      const timeSlot = new TimeSlot(
        day,
        parseTime(startTime),
        parseTime(endTime),
      );

      const created = await timeSlotRepo.create(timeSlot, userId);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          day: created.getDay(),
          startTime: formatTime(created.getStartTime()),
          endTime: formatTime(created.getEndTime()),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Failed to create time slot",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { day, startTime, endTime } = req.body;
      const userId = req.user!.id;

      if (!id || typeof id !== "string") {
        res
          .status(400)
          .json({ success: false, error: "TimeSlot ID is required" });
        return;
      }

      if (!day || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: day, startTime, endTime",
        });
        return;
      }

      const exists = await timeSlotRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: "TimeSlot not found" });
        return;
      }

      const timeSlot = new TimeSlot(
        day,
        parseTime(startTime),
        parseTime(endTime),
        id,
      );
      const updated = await timeSlotRepo.update(id, timeSlot);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          day: updated.getDay(),
          startTime: formatTime(updated.getStartTime()),
          endTime: formatTime(updated.getEndTime()),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Failed to update time slot",
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
          .json({ success: false, error: "TimeSlot ID is required" });
        return;
      }

      const exists = await timeSlotRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: "TimeSlot not found" });
        return;
      }

      await timeSlotRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: "TimeSlot deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to delete time slot",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const timeSlotController = new TimeSlotController();
