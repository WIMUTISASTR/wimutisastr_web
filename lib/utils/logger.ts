/**
 * Production-safe logging utility
 * Replaces console.log/error with structured logging that's safe for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Formats log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Sanitizes sensitive data from logs
   */
  private sanitize(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'authorization',
      'cookie',
      'session',
    ];

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.debug(this.formatMessage('debug', message, this.sanitize(context)));
    }
  }

  /**
   * Info logs - important non-error information
   */
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, this.sanitize(context)));
  }

  /**
   * Warning logs - potential issues that don't stop execution
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, this.sanitize(context)));
  }

  /**
   * Error logs - actual errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...this.sanitize(context),
    };

    if (error instanceof Error) {
      errorContext.error = {
        message: error.message,
        name: error.name,
        stack: this.isProduction ? undefined : error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    console.error(this.formatMessage('error', message, errorContext));
  }

  /**
   * Creates a child logger with default context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalMethods = {
      debug: childLogger.debug.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      error: childLogger.error.bind(childLogger),
    };

    childLogger.debug = (message: string, context?: LogContext) =>
      originalMethods.debug(message, { ...defaultContext, ...context });
    
    childLogger.info = (message: string, context?: LogContext) =>
      originalMethods.info(message, { ...defaultContext, ...context });
    
    childLogger.warn = (message: string, context?: LogContext) =>
      originalMethods.warn(message, { ...defaultContext, ...context });
    
    childLogger.error = (message: string, error?: Error | unknown, context?: LogContext) =>
      originalMethods.error(message, error, { ...defaultContext, ...context });

    return childLogger;
  }
}

export const logger = new Logger();

/**
 * Create a logger for a specific module/route
 */
export function createLogger(module: string): Logger {
  return logger.child({ module });
}
