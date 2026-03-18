import { Room } from '../../domain/entities/Room.js';
import { type IRoomRepository } from '../interfaces/IRoomRepository.js';
import prisma from '../../database/prisma.js';
import type { Room as PrismaRoom } from '@prisma/client';

export class PrismaRoomRepository implements IRoomRepository {

  private toDomain(prismaRoom: PrismaRoom): Room {
    return new Room(
      prismaRoom.id,
      prismaRoom.name,
      prismaRoom.capacity,
      prismaRoom.hasLabEquipment
    );
  }

  private toPrismaData(room: Room) {
    return {
      id: room.getId(),
      name: room.getName(),
      capacity: room.getCapacity(),
      hasLabEquipment: room.hasLabEquipment(),
    };
  }

  async create(room: Room): Promise<Room> {
    const data = this.toPrismaData(room);
    const created = await prisma.room.create({ data });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Room | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid room ID');
    }
    
    const found = await prisma.room.findUnique({
      where: { id },
    });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Room[]> {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' }
    });
    return rooms.map(r => this.toDomain(r));
  }

  async findByName(name: string): Promise<Room | null> {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid room name');
    }
    
    const found = await prisma.room.findFirst({
      where: { name: name.trim() },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCapacity(minCapacity: number): Promise<Room[]> {
    if (minCapacity < 0 || !Number.isInteger(minCapacity)) {
      throw new Error('Capacity must be a non-negative integer');
    }
    
    const rooms = await prisma.room.findMany({
      where: { capacity: { gte: minCapacity } },
      orderBy: { capacity: 'asc' }
    });
    return rooms.map(r => this.toDomain(r));
  }

  async findLabRooms(): Promise<Room[]> {
    const rooms = await prisma.room.findMany({
      where: { hasLabEquipment: true },
      orderBy: { name: 'asc' }
    });
    return rooms.map(r => this.toDomain(r));
  }

  async update(id: string, room: Room): Promise<Room> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid room ID');
    }
    
    const data = this.toPrismaData(room);
    const updated = await prisma.room.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid room ID');
    }
    
    await prisma.room.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    const count = await prisma.room.count({
      where: { id },
    });
    return count > 0;
  }
}