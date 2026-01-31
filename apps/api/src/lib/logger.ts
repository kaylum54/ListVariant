type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Serialize data for logging, handling Error objects and circular references.
 */
function serializeData(data: Record<string, any>): Record<string, any> {
  const serialized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Error) {
      serialized[key] = {
        message: value.message,
        name: value.name,
        ...(value.stack ? { stack: value.stack } : {}),
      };
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...(data && { data: serializeData(data) }),
    };

    let output: string;
    try {
      output = JSON.stringify(entry);
    } catch {
      // Fallback for circular references
      output = JSON.stringify({
        ...entry,
        data: { _serializationError: 'Could not serialize log data' },
      });
    }

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  info(message: string, data?: Record<string, any>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, any>): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, data);
    }
  }
}

export const createLogger = (service: string): Logger => new Logger(service);
export const logger = createLogger('tom-flips-api');
