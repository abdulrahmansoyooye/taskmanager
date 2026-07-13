import type { Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';

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
  async findAll(_req: AuthRequest, res: Response) {
    const users = await userService.findAll();
    return res.json(users);
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const user = await userService.create(parsed.data);
    return res.status(201).json(user);
  },

  async updateRole(req: AuthRequest, res: Response) {
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const user = await userService.updateRole(req.params.id as string, parsed.data.role);
    return res.json(user);
  },

  async delete(req: AuthRequest, res: Response) {
    await userService.delete(req.params.id as string, req.user!.id);
    return res.status(204).send();
  },
};
