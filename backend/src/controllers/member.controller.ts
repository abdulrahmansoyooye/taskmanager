import type { Response } from 'express';
import { z } from 'zod';
import { memberService } from '../services/member.service.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { sendSuccess, sendCreated, sendNoContent, sendValidationError } from '../utils/response.ts';

const addSchema = z.object({
  userId: z.string().uuid(),
});

export const memberController = {
  async findByProject(req: AuthRequest, res: Response) {
    const members = await memberService.findByProject(req.params.projectId as string, req.user!.role, req.user!.id);
    return sendSuccess(res, members);
  },

  async add(req: AuthRequest, res: Response) {
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const member = await memberService.add(req.params.projectId as string, parsed.data.userId, req.user!.role, req.user!.id);
    return sendCreated(res, member, 'Member added');
  },

  async remove(req: AuthRequest, res: Response) {
    await memberService.remove(req.params.projectId as string, req.params.userId as string, req.user!.role, req.user!.id);
    return sendNoContent(res);
  },
};
