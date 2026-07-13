import { PrismaClient } from '../generated/prisma/client.ts';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config/env.ts';
import { logger } from './logger.ts';

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  min: config.dbPoolMin,
  max: config.dbPoolMax,
  connectionTimeoutMillis: config.dbConnectionTimeoutMs,
  idleTimeoutMillis: config.dbIdleTimeoutMs,
});

pool.on('error', (err) => {
  logger.error(err, 'Unexpected database pool error');
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development'
    ? [{ level: 'query', emit: 'event' }, { level: 'error', emit: 'event' }, { level: 'info', emit: 'event' }, { level: 'warn', emit: 'event' }]
    : [{ level: 'error', emit: 'event' }, { level: 'warn', emit: 'event' }],
});

if (config.nodeEnv === 'development') {
  prisma.$on('query' as never, (e: unknown) => {
    const event = e as { query: string; params: string; duration: number };
    if (event.duration > 200) {
      logger.warn({ query: event.query, duration: event.duration }, 'Slow query detected');
    }
  });
}

prisma.$on('error' as never, (e: unknown) => {
  logger.error(e, 'Prisma client error');
});

export async function connectWithRetry(): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= config.dbMaxRetries; attempt++) {
    try {
      await prisma.$connect();
      logger.info({ attempt }, 'Database connected');
      return;
    } catch (err) {
      lastError = err;
      logger.error({ attempt, maxRetries: config.dbMaxRetries }, 'Database connection attempt failed');
      if (attempt < config.dbMaxRetries) {
        const delay = config.dbRetryDelayMs * Math.pow(2, attempt - 1);
        logger.info({ delayMs: delay }, 'Retrying database connection');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
  logger.info('Database disconnected');
}
