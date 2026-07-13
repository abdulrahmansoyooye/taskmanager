import type { Response } from 'express';
import { z } from 'zod';
import { projectService } from '../services/project.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { sendSuccess, sendCreated, sendNoContent, sendValidationError } from '../utils/response.ts';

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().default(''),
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
});

export const projectController = {
  async findAll(req: AuthRequest, res: Response) {
    const projects = await projectService.findAll(req.user!.role, req.user!.id);
    return sendSuccess(res, projects);
  },

  async findById(req: AuthRequest, res: Response) {
    const project = await projectService.findById(req.params.id as string, req.user!.role, req.user!.id);
    return sendSuccess(res, project);
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const project = await projectService.create(parsed.data, req.user!.id);
    return sendCreated(res, project, 'Project created');
  },

  async update(req: AuthRequest, res: Response) {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const project = await projectService.update(req.params.id as string, parsed.data as { name?: string; description?: string }, req.user!.role, req.user!.id);
    return sendSuccess(res, project, 'Project updated');
  },

  async delete(req: AuthRequest, res: Response) {
    await projectService.delete(req.params.id as string, req.user!.role, req.user!.id);
    return sendNoContent(res);
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const project = await projectService.updateStatus(req.params.id as string, parsed.data.status, req.user!.role, req.user!.id);
    return sendSuccess(res, project, 'Project status updated');
  },
};
