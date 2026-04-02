import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { PrismaRoomRepository } from '../repositories/implementations/PrismaRoomRepository.js';
import { Room } from '../domain/entities/Room.js';
import { randomUUID } from 'crypto';

const roomRepo = new PrismaRoomRepository();

export class RoomController {
  
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const rooms = await roomRepo.findAllByUserId(userId);
      
      res.json({
        success: true,
        data: rooms.map(r => ({
          id: r.getId(),
          name: r.getName(),
          capacity: r.getCapacity(),
          hasLabEquipment: r.hasLabEquipment()
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rooms',
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
          error: 'Room ID is required'
        });
        return;
      }

      const room = await roomRepo.findByIdAndUserId(id, userId);
      
      if (!room) {
        res.status(404).json({
          success: false,
          error: 'Room not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: room.getId(),
          name: room.getName(),
          capacity: room.getCapacity(),
          hasLabEquipment: room.hasLabEquipment()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, capacity, hasLabEquipment } = req.body;
      const userId = req.user!.id;

      const normalizedCapacity = Number(capacity);

      if (!name || !Number.isFinite(normalizedCapacity)) {
        res.status(400).json({
          success: false,
          error: 'Missing or invalid required fields: name, capacity'
        });
        return;
      }

      const room = new Room(
        randomUUID(),
        name,
        normalizedCapacity,
        Boolean(hasLabEquipment)
      );

      const created = await roomRepo.create(room, userId);

      res.status(201).json({
        success: true,
        data: {
          id: created.getId(),
          name: created.getName(),
          capacity: created.getCapacity(),
          hasLabEquipment: created.hasLabEquipment()
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create room',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, capacity, hasLabEquipment } = req.body;
      const userId = req.user!.id;

      const normalizedCapacity = Number(capacity);

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Room ID is required'
        });
        return;
      }

      const exists = await roomRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: 'Room not found'
        });
        return;
      }

      if (!name || !Number.isFinite(normalizedCapacity)) {
        res.status(400).json({
          success: false,
          error: 'Missing or invalid required fields: name, capacity'
        });
        return;
      }

      const room = new Room(id, name, normalizedCapacity, Boolean(hasLabEquipment));
      const updated = await roomRepo.update(id, room, userId);

      res.json({
        success: true,
        data: {
          id: updated.getId(),
          name: updated.getName(),
          capacity: updated.getCapacity(),
          hasLabEquipment: updated.hasLabEquipment()
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update room',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Room ID is required' });
        return;
      }

      const exists = await roomRepo.existsByIdAndUserId(id, userId);
      if (!exists) {
        res.status(404).json({ success: false, error: 'Room not found' });
        return;
      }

      await roomRepo.deleteByIdAndUserId(id, userId);
      res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete room',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const roomController = new RoomController();
