import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { PrismaSubjectRepository } from "../repositories/implementations/PrismaSubjectRepository.js";
import { Subject } from "../domain/entities/Subject.js";
import { randomUUID } from "crypto";

const subjectRepo = new PrismaSubjectRepository();

export class SubjectController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const subjects = await subjectRepo.findAllByUserId(userId);

      res.json({
        success: true,
        data: subjects.map((s) => ({
          id: s.getId(),
          name: s.getName(),
          code: s.getCode(),
          hoursPerWeek: s.getHoursPerWeek(),
          requiresLab: s.requiresLab(),
          maxSessionsPerDay: s.getMaxSessionsPerDay(),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch subjects",
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
          error: "Subject ID is required",
        });
        return;
      }

      const subject = await subjectRepo.findByIdAndUserId(id, userId);

      if (!subject) {
        res.status(404).json({
          success: false,
          error: "Subject not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: subject.getId(),
          name: subject.getName(),
          code: subject.getCode(),
          hoursPerWeek: subject.getHoursPerWeek(),
          requiresLab: subject.requiresLab(),
          maxSessionsPerDay: subject.getMaxSessionsPerDay(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch subject",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, code, hoursPerWeek, requiresLab, maxSessionsPerDay } =
        req.body;
      const userId = req.user!.id;

      const normalizedHoursPerWeek = Number(hoursPerWeek);
      const normalizedMaxSessionsPerDay = Number(maxSessionsPerDay);

      if (
        !name ||
        !code ||
        !Number.isFinite(normalizedHoursPerWeek) ||
        !Number.isFinite(normalizedMaxSessionsPerDay)
      ) {
        res.status(400).json({
          success: false,
          error:
            "Missing or invalid required fields: name, code, hoursPerWeek, maxSessionsPerDay",
        });
        return;
      }

      const subject = new Subject(
        randomUUID(),
        name,
        code,
        normalizedHoursPerWeek,
        requiresLab || false,
        normalizedMaxSessionsPerDay,
      );

      const created = await subjectRepo.create(subject, userId);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          name: created.getName(),
          code: created.getCode(),
          hoursPerWeek: created.getHoursPerWeek(),
          requiresLab: created.requiresLab(),
          maxSessionsPerDay: created.getMaxSessionsPerDay(),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Failed to create subject",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, hoursPerWeek, requiresLab, maxSessionsPerDay } =
        req.body;
      const userId = req.user!.id;

      const normalizedHoursPerWeek = Number(hoursPerWeek);
      const normalizedMaxSessionsPerDay = Number(maxSessionsPerDay);

      if (!id || typeof id !== "string") {
        res.status(400).json({
          success: false,
          error: "Subject ID is required",
        });
        return;
      }

      const exists = await subjectRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: "Subject not found",
        });
        return;
      }

      if (
        !name ||
        !code ||
        !Number.isFinite(normalizedHoursPerWeek) ||
        !Number.isFinite(normalizedMaxSessionsPerDay)
      ) {
        res.status(400).json({
          success: false,
          error:
            "Missing or invalid required fields: name, code, hoursPerWeek, maxSessionsPerDay",
        });
        return;
      }

      const subject = new Subject(
        id,
        name,
        code,
        normalizedHoursPerWeek,
        Boolean(requiresLab),
        normalizedMaxSessionsPerDay,
      );
      const updated = await subjectRepo.update(id, subject, userId);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          name: updated.getName(),
          code: updated.getCode(),
          hoursPerWeek: updated.getHoursPerWeek(),
          requiresLab: updated.requiresLab(),
          maxSessionsPerDay: updated.getMaxSessionsPerDay(),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Failed to update subject",
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
          .json({ success: false, error: "Subject ID is required" });
        return;
      }

      const exists = await subjectRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: "Subject not found" });
        return;
      }

      await subjectRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: "Subject deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to delete subject",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const subjectController = new SubjectController();
