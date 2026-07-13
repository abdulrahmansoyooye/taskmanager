import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.ts';
import { config } from '../config/env.ts';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err, 'Unhandled error');
  return res.status(500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
}
