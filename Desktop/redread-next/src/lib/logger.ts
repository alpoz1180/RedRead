/**
 * Structured logger for redread-next.
 *
 * Development : colorized, human-readable output with timestamps.
 * Production  : JSON lines — each log is a single JSON object, suitable
 *               for Vercel log drains, Datadog, or any cloud log aggregator.
 *
 * TODO (Sentry): When @sentry/nextjs is added, import it here and call
 *   Sentry.captureException(data instanceof Error ? data : new Error(message))
 *   inside the `error` level handler.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

// ANSI colour codes — only used in development (Node.js / terminal).
const COLOURS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

const isDev = process.env.NODE_ENV === 'development';

function formatDevLine(level: LogLevel, message: string, data?: unknown): string {
  const colour = COLOURS[level];
  const timestamp = new Date().toISOString();
  const tag = `${colour}[${level.toUpperCase()}]${RESET}`;
  const prefix = `\x1b[90m${timestamp}${RESET} ${tag}`;

  return data !== undefined
    ? `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    : `${prefix} ${message}`;
}

function formatProdEntry(level: LogLevel, message: string, data?: unknown): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data !== undefined && { data }),
  };
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, data?: unknown): void {
  // Skip debug logs in production to reduce noise.
  if (level === 'debug' && !isDev) return;

  if (isDev) {
    const line = formatDevLine(level, message, data);
    switch (level) {
      case 'debug': console.debug(line); break;
      case 'info':  console.info(line);  break;
      case 'warn':  console.warn(line);  break;
      case 'error': console.error(line); break;
    }
  } else {
    // Production: emit a single JSON line to stdout/stderr.
    const line = formatProdEntry(level, message, data);
    if (level === 'error' || level === 'warn') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }

    // TODO (Sentry): uncomment once @sentry/nextjs is installed:
    //
    // import * as Sentry from '@sentry/nextjs';
    //
    // if (level === 'error') {
    //   try {
    //     const err = data instanceof Error ? data : new Error(message);
    //     Sentry.captureException(err, { extra: { message, data } });
    //   } catch {
    //     // Never let Sentry reporting crash the application.
    //   }
    // }
  }
}

export const logger = {
  /** Verbose output — stripped from production builds automatically. */
  debug: (message: string, data?: unknown) => log('debug', message, data),

  /** General informational events (server start, cache hit, etc.). */
  info:  (message: string, data?: unknown) => log('info',  message, data),

  /** Something unexpected but non-fatal. */
  warn:  (message: string, data?: unknown) => log('warn',  message, data),

  /**
   * An error that needs attention.
   * Pass the original Error object as `data` so it is preserved in
   * structured logs (and later forwarded to Sentry).
   */
  error: (message: string, data?: unknown) => log('error', message, data),
};
