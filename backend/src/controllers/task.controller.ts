import type { Response } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { sendSuccess, sendCreated, sendNoContent, sendValidationError } from '../utils/response.ts';

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime(),
  assignedTo: z.string().uuid().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

export const taskController = {
  async findAssigned(req: AuthRequest, res: Response) {
    const tasks = await taskService.findAssigned(req.user!.id);
    return sendSuccess(res, tasks);
  },

  async findByProject(req: AuthRequest, res: Response) {
    const tasks = await taskService.findByProject(req.params.projectId as string, req.user!.role, req.user!.id);
    return sendSuccess(res, tasks);
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const task = await taskService.create(req.params.projectId as string, parsed.data as { title: string; description?: string; priority?: string; dueDate: string; assignedTo?: string }, req.user!.role, req.user!.id);
    return sendCreated(res, task, 'Task created');
  },

  async findById(req: AuthRequest, res: Response) {
    const task = await taskService.findById(req.params.id as string, req.user!.role, req.user!.id);
    return sendSuccess(res, task);
  },

  async update(req: AuthRequest, res: Response) {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
    if (parsed.data.dueDate !== undefined) data.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.assignedTo !== undefined) data.assignedTo = parsed.data.assignedTo;

    const task = await taskService.update(req.params.id as string, data, req.user!.role, req.user!.id);
    return sendSuccess(res, task, 'Task updated');
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const task = await taskService.updateStatus(req.params.id as string, parsed.data.status, req.user!.role, req.user!.id);
    return sendSuccess(res, task, 'Task status updated');
  },

  async delete(req: AuthRequest, res: Response) {
    await taskService.delete(req.params.id as string, req.user!.role, req.user!.id);
    return sendNoContent(res);
  },
};
