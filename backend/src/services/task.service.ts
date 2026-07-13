import { prisma } from '../utils/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} as const;

function canManage(role: string, creatorId: string, userId: string) {
  return role === 'ADMIN' || (role === 'PROJECT_MANAGER' && creatorId === userId);
}

export const taskService = {
  async findAssigned(userId: string) {
    return prisma.task.findMany({
      where: { assignedTo: userId },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findByProject(projectId: string, role: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { userId }, select: { id: true } } },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const isOwner = project.creatorId === userId;
    const isMember = project.members.length > 0;
    if (role !== 'ADMIN' && !isOwner && !isMember) {
      throw new AppError(403, 'Insufficient permissions');
    }

    return prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(projectId: string, data: {
    title: string; description?: string; priority?: string; dueDate: string; assignedTo?: string;
  }, role: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'Project not found');
    if (!canManage(role, project.creatorId, userId)) throw new AppError(403, 'Insufficient permissions');

    if (data.assignedTo) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: data.assignedTo } },
      });
      if (!member) throw new AppError(400, 'Assignee is not a member of this project');
    }

    const taskData: Record<string, unknown> = {
      projectId,
      title: data.title,
      description: data.description ?? '',
      priority: data.priority ?? 'MEDIUM',
      dueDate: new Date(data.dueDate),
    };
    if (data.assignedTo !== undefined) taskData.assignedTo = data.assignedTo;

    return prisma.task.create({
      data: taskData as never,
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  },

  async findById(taskId: string, role: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, creatorId: true, members: { select: { userId: true } } } },
        _count: { select: { comments: true } },
      },
    });
    if (!task) throw new AppError(404, 'Task not found');

    const isOwner = task.project.creatorId === userId;
    const isAssignee = task.assignedTo === userId;
    const isMember = task.project.members.some(m => m.userId === userId);
    if (role !== 'ADMIN' && !isOwner && !isAssignee && !isMember) {
      throw new AppError(403, 'Insufficient permissions');
    }
    return task;
  },

  async update(taskId: string, data: Record<string, unknown>, role: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { creatorId: true } } },
    });
    if (!task) throw new AppError(404, 'Task not found');
    if (!canManage(role, task.project.creatorId, userId)) throw new AppError(403, 'Insufficient permissions');

    return prisma.task.update({
      where: { id: taskId },
      data,
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  },

  async updateStatus(taskId: string, status: string, role: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { creatorId: true } } },
    });
    if (!task) throw new AppError(404, 'Task not found');

    const isOwner = task.project.creatorId === userId;
    const isAssignee = task.assignedTo === userId;
    if (role !== 'ADMIN' && !isOwner && !isAssignee) throw new AppError(403, 'Insufficient permissions');

    return prisma.task.update({
      where: { id: taskId },
      data: { status: status as never },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  },

  async delete(taskId: string, role: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { creatorId: true } } },
    });
    if (!task) throw new AppError(404, 'Task not found');
    if (!canManage(role, task.project.creatorId, userId)) throw new AppError(403, 'Insufficient permissions');

    await prisma.task.delete({ where: { id: taskId } });
  },
};
