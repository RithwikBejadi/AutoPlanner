import { Room } from '../../domain/entities/Room.js';

export interface IRoomRepository {
  create(room: Room, userId: string): Promise<Room>;
  
  findById(id: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  findAllByUserId(userId: string): Promise<Room[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Room | null>;
  findByName(name: string): Promise<Room | null>;
  findByCapacity(minCapacity: number): Promise<Room[]>;
  findLabRooms(): Promise<Room[]>;
  
  update(id: string, room: Room, userId: string): Promise<Room>;
  
  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
