import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import expressWinston from 'express-winston';
import authRoutes from './routes/auth.ts';
import projectRoutes from './routes/projects.ts';
import taskRoutes from './routes/tasks.ts';
import commentRoutes from './routes/comments.ts';
import memberRoutes from './routes/members.ts';
import userRoutes from './routes/users.ts';
import { config } from './config/env.ts';
import { winstonLogger } from './utils/logger.ts';
import { prisma } from './utils/prisma.ts';
import { errorHandler } from './middleware/errorHandler.ts';

const app = express();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(expressWinston.logger({
  winstonInstance: winstonLogger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: config.nodeEnv === 'development',
  ignoreRoute: () => false,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/users', userRoutes);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use(errorHandler);

export default app;
