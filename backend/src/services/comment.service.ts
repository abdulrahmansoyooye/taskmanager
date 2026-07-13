import { prisma } from '../utils/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';

export const commentService = {
  async findByTask(taskId: string, role: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { creatorId: true, members: { select: { userId: true } } } },
      },
    });
    if (!task) throw new AppError(404, 'Task not found');

    const isAssignee = task.assignedTo === userId;
    const isProjectCreator = task.project.creatorId === userId;
    const isMember = task.project.members.some(m => m.userId === userId);
    if (role !== 'ADMIN' && !isProjectCreator && !isAssignee && !isMember) {
      throw new AppError(403, 'Insufficient permissions');
    }

    return prisma.taskComment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(taskId: string, comment: string, userId: string, role: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { creatorId: true, members: { select: { userId: true } } } },
      },
    });
    if (!task) throw new AppError(404, 'Task not found');

    const isAssignee = task.assignedTo === userId;
    const isProjectCreator = task.project.creatorId === userId;
    const isMember = task.project.members.some(m => m.userId === userId);
    if (role !== 'ADMIN' && !isProjectCreator && !isAssignee && !isMember) {
      throw new AppError(403, 'Insufficient permissions');
    }

    return prisma.taskComment.create({
      data: { taskId, userId, comment },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },
};
