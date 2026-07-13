import type { Response } from 'express';
import { z } from 'zod';
import { commentService } from '../services/comment.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const createSchema = z.object({
  comment: z.string().min(1).max(2000),
});

export const commentController = {
  async findByTask(req: AuthRequest, res: Response) {
    const comments = await commentService.findByTask(req.params.taskId as string, req.user!.role, req.user!.id);
    return res.json(comments);
  },

  async create(req: AuthRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const comment = await commentService.create(req.params.taskId as string, parsed.data.comment, req.user!.id, req.user!.role);
    return res.status(201).json(comment);
  },
};
