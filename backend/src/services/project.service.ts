import { prisma } from '../utils/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import type { Role } from '../generated/prisma/client.ts';

const projectInclude = {
  creator: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, members: true } },
} as const;

export const projectService = {
  async findAll(role: string, userId: string) {
    if (role === 'ADMIN') {
      return prisma.project.findMany({ include: projectInclude, orderBy: { createdAt: 'desc' } });
    }
    if (role === 'PROJECT_MANAGER') {
      return prisma.project.findMany({
        where: { creatorId: userId },
        include: projectInclude,
        orderBy: { createdAt: 'desc' },
      });
    }
    return prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(projectId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const isAdmin = role === 'ADMIN';
    const isOwner = role === 'PROJECT_MANAGER' && project.creatorId === userId;
    const isMember = project.members.some(m => m.userId === userId);

    if (!isAdmin && !isOwner && !(role === 'TEAM_MEMBER' && isMember)) {
      throw new AppError(403, 'Insufficient permissions');
    }
    return project;
  },

  async create(data: { name: string; description: string }, creatorId: string) {
    return prisma.project.create({
      data: { name: data.name, description: data.description, creatorId },
    });
  },

  async update(projectId: string, data: { name?: string; description?: string }, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const canManage = role === 'ADMIN' || (role === 'PROJECT_MANAGER' && project.creatorId === userId);
    if (!canManage) throw new AppError(403, 'Insufficient permissions');

    const updateData: Record<string, string> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    return prisma.project.update({ where: { id: projectId }, data: updateData });
  },

  async delete(projectId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const canManage = role === 'ADMIN' || (role === 'PROJECT_MANAGER' && project.creatorId === userId);
    if (!canManage) throw new AppError(403, 'Insufficient permissions');

    await prisma.project.delete({ where: { id: projectId } });
  },

  async updateStatus(projectId: string, status: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const canManage = role === 'ADMIN' || (role === 'PROJECT_MANAGER' && project.creatorId === userId);
    if (!canManage) throw new AppError(403, 'Insufficient permissions');

    return prisma.project.update({ where: { id: projectId }, data: { status: status as never } });
  },
};
