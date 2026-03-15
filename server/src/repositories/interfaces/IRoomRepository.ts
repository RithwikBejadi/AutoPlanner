import { Room } from '../../domain/entities/Room.js';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  
  findById(id: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  findByName(name: string): Promise<Room | null>;
  findByCapacity(minCapacity: number): Promise<Room[]>;
  findLabRooms(): Promise<Room[]>;
  
  update(id: string, room: Room): Promise<Room>;
  
  delete(id: string): Promise<void>;
  
  exists(id: string): Promise<boolean>;
}
