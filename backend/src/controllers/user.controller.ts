import type { Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { sendSuccess, sendCreated, sendNoContent, sendValidationError } from '../utils/response.ts';

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']),
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']),
});

export const userController = {
  async findAll(req: AuthRequest, res: Response) {
    const role = req.query.role as string | undefined;
    const users = await userService.findAll(role);
    return sendSuccess(res, users);
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const user = await userService.create(parsed.data);
    return sendCreated(res, user, 'User created');
  },

  async updateRole(req: AuthRequest, res: Response) {
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const user = await userService.updateRole(req.params.id as string, parsed.data.role);
    return sendSuccess(res, user, 'Role updated');
  },

  async delete(req: AuthRequest, res: Response) {
    await userService.delete(req.params.id as string, req.user!.id);
    return sendNoContent(res);
  },
};
