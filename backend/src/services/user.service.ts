import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';

const userSelect = { id: true, name: true, email: true, role: true, createdAt: true };

export const userService = {
  async findAll(role?: string) {
    return prisma.user.findMany({
      where: role ? { role: role as never } : undefined,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: { name: string; email: string; password: string; role: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role as never },
      select: userSelect,
    });
  },

  async updateRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { role: role as never },
      select: userSelect,
    });
  },

  async delete(userId: string, requesterId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');
    if (userId === requesterId) throw new AppError(400, 'Cannot delete yourself');

    await prisma.user.delete({ where: { id: userId } });
  },
};
