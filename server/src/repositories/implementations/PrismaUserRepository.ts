import { PrismaClient, type User } from '@prisma/client';
import type { IUserRepository, CreateUserData, UpdateUserData } from '../interfaces/IUserRepository.js';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        picture: data.picture || null
      }
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.picture !== undefined) updateData.picture = data.picture || null;
    if (data.email !== undefined) updateData.email = data.email;

    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }
}
