import winston from 'winston';
import { config } from '../config/env.ts';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stackTrace = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}]: ${message}${extras}${stackTrace}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const winstonLogger = winston.createLogger({
  level: config.logLevel,
  format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

function log(method: 'info' | 'warn' | 'error', arg1: unknown, arg2?: string) {
  if (arg2) {
    const obj = arg1 instanceof Error
      ? { message: arg1.message, stack: arg1.stack }
      : arg1;
    winstonLogger[method](arg2, obj as Record<string, unknown>);
  } else if (arg1 instanceof Error) {
    winstonLogger[method](arg1.message, { stack: arg1.stack });
  } else if (typeof arg1 === 'string') {
    winstonLogger[method](arg1);
  } else {
    winstonLogger[method]('', arg1 as Record<string, unknown>);
  }
}

export const logger = {
  info: (arg1: unknown, arg2?: string) => log('info', arg1, arg2),
  warn: (arg1: unknown, arg2?: string) => log('warn', arg1, arg2),
  error: (arg1: unknown, arg2?: string) => log('error', arg1, arg2),
};
