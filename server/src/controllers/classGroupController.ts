import { type Request, type Response } from 'express';
import { PrismaClassGroupRepository } from '../repositories/implementations/PrismaClassGroupRepository.js';
import { ClassGroup } from '../domain/entities/ClassGroup.js';
import { randomUUID } from 'crypto';

const classGroupRepo = new PrismaClassGroupRepository();

export class ClassGroupController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const classGroups = await classGroupRepo.findAll();
      
      res.json({
        success: true,
        data: classGroups.map(cg => ({
          id: cg.getId(),
          name: cg.getName(),
          studentCount: cg.getStudentCount()
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch class groups',
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
          error: 'ClassGroup ID is required'
        });
        return;
      }

      const classGroup = await classGroupRepo.findById(id);
      
      if (!classGroup) {
        res.status(404).json({
          success: false,
          error: 'ClassGroup not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: classGroup.getId(),
          name: classGroup.getName(),
          studentCount: classGroup.getStudentCount()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch class group',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, studentCount } = req.body;

      if (!name || !studentCount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, studentCount'
        });
        return;
      }

      const classGroup = new ClassGroup(
        randomUUID(),
        name,
        studentCount
      );

      const created = await classGroupRepo.create(classGroup);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          name: created.getName(),
          studentCount: created.getStudentCount()
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create class group',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, studentCount } = req.body;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'ClassGroup ID is required'
        });
        return;
      }

      const exists = await classGroupRepo.exists(id);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: 'ClassGroup not found'
        });
        return;
      }

      const classGroup = new ClassGroup(id, name, studentCount);
      const updated = await classGroupRepo.update(id, classGroup);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          name: updated.getName(),
          studentCount: updated.getStudentCount()
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update class group',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'ClassGroup ID is required' });
        return;
      }

      const exists = await classGroupRepo.exists(id);
      if (!exists) {
        res.status(404).json({ success: false, error: 'ClassGroup not found' });
        return;
      }

      await classGroupRepo.delete(id);
      res.json({ success: true, message: 'ClassGroup deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete class group',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const classGroupController = new ClassGroupController();
