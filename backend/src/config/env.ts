import dotenv from 'dotenv';
dotenv.config();

function env(name: string, fallback: string): string;
function env(name: string, fallback?: string): string | undefined;
function env(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export const config = {
  port: Number(env('PORT', '4000')),
  nodeEnv: env('NODE_ENV', 'development'),
  databaseUrl: env('DATABASE_URL')!,
  jwtSecret: env('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtAccessExpiresIn: env('JWT_ACCESS_EXPIRES_IN', '15m'),
  jwtRefreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
  corsOrigins: env('CORS_ORIGINS', 'http://localhost:3000').split(',').map(s => s.trim()),
  cookieSecure: env('NODE_ENV', 'development') === 'production',
  logLevel: env('LOG_LEVEL', 'info'),
  dbPoolMin: Number(env('DB_POOL_MIN', '2')),
  dbPoolMax: Number(env('DB_POOL_MAX', '10')),
  dbConnectionTimeoutMs: Number(env('DB_CONNECTION_TIMEOUT_MS', '10000')),
  dbIdleTimeoutMs: Number(env('DB_IDLE_TIMEOUT_MS', '30000')),
  dbMaxRetries: Number(env('DB_MAX_RETRIES', '3')),
  dbRetryDelayMs: Number(env('DB_RETRY_DELAY_MS', '1000')),
};
