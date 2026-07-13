import { prisma } from '../utils/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';

export const memberService = {
  async findByProject(projectId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true, members: { select: { userId: true } } },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const isProjectCreator = project.creatorId === userId;
    const isMember = project.members.some(m => m.userId === userId);
    if (role !== 'ADMIN' && !isProjectCreator && !isMember) {
      throw new AppError(403, 'Insufficient permissions');
    }

    return prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { joinedAt: 'asc' },
    });
  },

  async add(projectId: string, targetUserId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const isOwner = project.creatorId === userId;
    if (role !== 'ADMIN' && !(role === 'PROJECT_MANAGER' && isOwner)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    const userExists = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!userExists) throw new AppError(404, 'User not found');

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });
    if (existing) throw new AppError(409, 'User is already a member');

    return prisma.projectMember.create({
      data: { projectId, userId: targetUserId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  },

  async remove(projectId: string, targetUserId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');

    const isOwner = project.creatorId === userId;
    if (role !== 'ADMIN' && !(role === 'PROJECT_MANAGER' && isOwner)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });
    if (!member) throw new AppError(404, 'Member not found');

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });
  },
};
