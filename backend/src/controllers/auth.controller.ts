import type { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.ts';
import { setTokenCookies, clearTokenCookies } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { sendSuccess, sendCreated, sendValidationError, sendUnauthorized } from '../utils/response.ts';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const user = await authService.register({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
    });
    return sendCreated(res, user, 'Registration successful');
  },

  async login(req: AuthRequest, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error.issues);

    const result = await authService.login(parsed.data.email, parsed.data.password);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, { token: result.accessToken, user: result.user }, 'Login successful');
  },

  async refresh(req: AuthRequest, res: Response) {
    const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!refreshToken) return sendUnauthorized(res, 'Refresh token required');

    const result = await authService.refresh(refreshToken);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, { token: result.accessToken });
  },

  async logout(_req: AuthRequest, res: Response) {
    clearTokenCookies(res);
    return sendSuccess(res, null, 'Logged out');
  },
};
