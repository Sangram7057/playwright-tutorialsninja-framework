/**
 * Centralised structured logging built on Winston.
 *
 * Responsibility (SRP): provide one consistent logger for the whole framework
 * so every action (navigation, click, fill, validation, retry, failure) is
 * recorded the same way — to the console (human readable) and to rotating log
 * files (machine readable / CI artifacts).
 *
 * Usage:
 *   import { logger } from '@utils/logger';
 *   logger.info('Login submitted');
 *
 *   // Scoped logger adds a prefix so logs are traceable to a component:
 *   const log = createLogger('LoginPage');
 *   log.debug('Filling email field');
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import winston from 'winston';
import { env } from '@config/env.config';

const LOG_DIR = resolve(process.cwd(), 'logs');

// Ensure the log directory exists before any transport writes to it.
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

/** Human-friendly, colourised format for the console. */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, scope }) => {
    const prefix = scope ? `[${String(scope)}] ` : '';
    return `${String(timestamp)} ${level}: ${prefix}${String(message)}`;
  }),
);

/** Structured JSON format for persisted log files (easy to parse in CI). */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/** The shared base logger instance. */
export const logger = winston.createLogger({
  level: env.logLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: resolve(LOG_DIR, 'error.log'),
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: resolve(LOG_DIR, 'combined.log'),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

/**
 * Creates a scoped child logger that tags every line with the given scope
 * (typically a page/component name) for easy traceability.
 */
export function createLogger(scope: string): winston.Logger {
  return logger.child({ scope });
}
