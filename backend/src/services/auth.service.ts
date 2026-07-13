import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.ts';
import { config } from '../config/env.ts';
import { AppError } from '../middleware/errorHandler.ts';
import type { TokenPayload } from '../middleware/auth.ts';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.ts';

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: (data.role ?? 'TEAM_MEMBER') as never,
      },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, config.jwtSecret) as TokenPayload;
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') throw new AppError(401, 'Invalid token type');

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new AppError(401, 'User not found');

    const tokenPayload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken: newRefreshToken };
  },
};
