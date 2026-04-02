import type { User } from '@prisma/client';

export interface CreateUserData {
  googleId: string;
  email: string;
  name: string;
  picture?: string | undefined;
}

export interface UpdateUserData {
  name?: string | undefined;
  picture?: string | undefined;
  email?: string | undefined;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
