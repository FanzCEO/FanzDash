/**
 * Centralized Logging System for FanzDash
 *
 * Replaces console.log with structured logging
 * Supports different log levels and environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private serviceName: string;
  private isProd: boolean;

  constructor(serviceName: string = 'FanzDash') {
    this.serviceName = serviceName;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...(metadata && { metadata })
    };

    if (this.isProd) {
      // In production, output JSON for log aggregation tools
      return JSON.stringify(logObject);
    } else {
      // In development, use readable format
      const metaStr = metadata ? `\n${JSON.stringify(metadata, null, 2)}` : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${this.serviceName}: ${message}${metaStr}`;
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (!this.isProd) {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }

  info(message: string, metadata?: LogMetadata): void {
    console.info(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, error?: Error | any, metadata?: LogMetadata): void {
    const errorMetadata = error instanceof Error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...metadata
    } : { error, ...metadata };

    console.error(this.formatMessage('error', message, errorMetadata));
  }

  // Specialized logging methods
  http(method: string, path: string, statusCode: number, duration?: number): void {
    this.info(`HTTP ${method} ${path}`, {
      method,
      path,
      statusCode,
      ...(duration && { duration: `${duration}ms` })
    });
  }

  database(operation: string, table: string, duration?: number, error?: Error): void {
    if (error) {
      this.error(`Database ${operation} failed on ${table}`, error);
    } else {
      this.debug(`Database ${operation} on ${table}`, {
        operation,
        table,
        ...(duration && { duration: `${duration}ms` })
      });
    }
  }

  auth(action: string, userId?: string, success: boolean = true, metadata?: LogMetadata): void {
    const level = success ? 'info' : 'warn';
    const message = `Auth ${action}: ${success ? 'success' : 'failed'}`;

    if (level === 'info') {
      this.info(message, { action, userId, ...metadata });
    } else {
      this.warn(message, { action, userId, ...metadata });
    }
  }

  moderation(action: string, contentId: string, result: string, metadata?: LogMetadata): void {
    this.info(`Moderation ${action}`, {
      action,
      contentId,
      result,
      ...metadata
    });
  }

  payment(action: string, amount: number, userId: string, success: boolean, metadata?: LogMetadata): void {
    const level = success ? 'info' : 'error';
    const message = `Payment ${action}: ${success ? 'success' : 'failed'}`;

    if (level === 'info') {
      this.info(message, { action, amount, userId, ...metadata });
    } else {
      this.error(message, undefined, { action, amount, userId, ...metadata });
    }
  }

  ai(model: string, operation: string, duration?: number, tokens?: number): void {
    this.debug(`AI ${model} - ${operation}`, {
      model,
      operation,
      ...(duration && { duration: `${duration}ms` }),
      ...(tokens && { tokens })
    });
  }

  stream(action: string, streamId: string, viewerCount?: number, metadata?: LogMetadata): void {
    this.info(`Stream ${action}`, {
      action,
      streamId,
      ...(viewerCount !== undefined && { viewerCount }),
      ...metadata
    });
  }
}

// Create singleton instances for different services
export const logger = new Logger('FanzDash');
export const authLogger = new Logger('FanzDash-Auth');
export const dbLogger = new Logger('FanzDash-DB');
export const moderationLogger = new Logger('FanzDash-Moderation');
export const paymentLogger = new Logger('FanzDash-Payment');
export const streamLogger = new Logger('FanzDash-Stream');

// Default export
export default logger;
