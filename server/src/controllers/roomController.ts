import { type Request, type Response } from 'express';
import { PrismaRoomRepository } from '../repositories/implementations/PrismaRoomRepository.js';
import { Room } from '../domain/entities/Room.js';
import { randomUUID } from 'crypto';

const roomRepo = new PrismaRoomRepository();

export class RoomController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await roomRepo.findAll();
      
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Room ID is required'
        });
        return;
      }

      const room = await roomRepo.findById(id);
      
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, capacity, hasLabEquipment } = req.body;

      if (!name || !capacity) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, capacity'
        });
        return;
      }

      const room = new Room(
        randomUUID(),
        name,
        capacity,
        hasLabEquipment || false
      );

      const created = await roomRepo.create(room);

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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, capacity, hasLabEquipment } = req.body;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Room ID is required'
        });
        return;
      }

      const exists = await roomRepo.exists(id);
      if (!exists) {
        res.status(404).json({
          success: false,
          error: 'Room not found'
        });
        return;
      }

      const room = new Room(id, name, capacity, hasLabEquipment);
      const updated = await roomRepo.update(id, room);

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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Room ID is required' });
        return;
      }

      const exists = await roomRepo.exists(id);
      if (!exists) {
        res.status(404).json({ success: false, error: 'Room not found' });
        return;
      }

      await roomRepo.delete(id);
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
