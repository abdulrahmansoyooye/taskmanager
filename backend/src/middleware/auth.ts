import type { Request, Response, NextFunction } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.ts';

export interface TokenPayload {
  id: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token ?? req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function generateAccessToken(payload: { id: string; role: string }) {
  return jwt.sign({ ...payload, type: 'access' as const }, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  } as SignOptions);
}

export function generateRefreshToken(payload: { id: string; role: string }) {
  return jwt.sign({ ...payload, type: 'refresh' as const }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  } as SignOptions);
}

export function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  const cookieOpts = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict' as const,
    path: '/',
  };
  res.cookie('token', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearTokenCookies(res: Response) {
  const cookieOpts = { httpOnly: true, secure: config.cookieSecure, sameSite: 'strict' as const, path: '/' };
  res.clearCookie('token', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
}
