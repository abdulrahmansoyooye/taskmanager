import app from './app.ts';
import { prisma, connectWithRetry, disconnect } from './utils/prisma.ts';
import { config } from './config/env.ts';
import { logger } from './utils/logger.ts';

try {
  await connectWithRetry();
  const server = app.listen(config.port, () => logger.info(`Server running on port ${config.port}`));

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (err) {
  logger.error(err, 'Failed to start server');
  process.exit(1);
}
