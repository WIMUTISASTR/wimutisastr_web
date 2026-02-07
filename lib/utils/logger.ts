/**
 * Environment-aware logger utility
 * Only logs in development mode, silent in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogContext = Record<string, unknown>;

function formatContext(context?: LogContext): string {
  if (!context) return '';
  if (typeof context.module === 'string' && context.module.trim() !== '') {
    return `[${context.module}]`;
  }
  return '';
}

export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always logged, even in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug messages with a prefix (development only)
   */
  debug: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG:${context}]`, ...args);
    }
  },

  /**
   * Log informational messages with a prefix (development only)
   */
  info: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO:${context}]`, ...args);
    }
  },

  /**
   * Create a child logger with static context
   */
  child: (context?: LogContext) => {
    const prefix = formatContext(context);
    return {
      log: (...args: any[]) => {
        if (isDevelopment) {
          console.log(prefix, ...args);
        }
      },
      warn: (...args: any[]) => {
        if (isDevelopment) {
          console.warn(prefix, ...args);
        }
      },
      error: (...args: any[]) => {
        console.error(prefix, ...args);
      },
      debug: (ctx: string, ...args: any[]) => {
        if (isDevelopment) {
          console.log(`[DEBUG:${ctx}]`, prefix, ...args);
        }
      },
      info: (ctx: string, ...args: any[]) => {
        if (isDevelopment) {
          console.info(`[INFO:${ctx}]`, prefix, ...args);
        }
      },
      child: (next?: LogContext) => {
        const merged = { ...(context ?? {}), ...(next ?? {}) };
        return logger.child(merged);
      },
    };
  },
};

export default logger;
