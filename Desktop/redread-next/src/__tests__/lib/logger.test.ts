import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tests for src/lib/logger.ts
// We test behaviour, not internal branching — import the real module.
// ---------------------------------------------------------------------------

// Capture the original NODE_ENV so we can restore it
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore NODE_ENV after each test that may override it
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  // -------------------------------------------------------------------------
  // Development mode — logging should be active.
  // The logger formats everything into a single ANSI-coloured string and passes
  // that as the sole argument to the matching console method.
  // -------------------------------------------------------------------------

  describe('in development mode', () => {
    it('logger.error() calls console.error in development', async () => {
      process.env.NODE_ENV = 'development';

      // Re-import the module so it picks up the new NODE_ENV value
      const { logger } = await import('@/lib/logger?dev-error');

      logger.error('something broke', { detail: 'extra' });

      // The logger passes a single formatted string (with ANSI codes) to console.error
      expect(console.error).toHaveBeenCalledOnce();
      const [firstArg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
      expect(firstArg).toContain('something broke');
    });

    it('logger.warn() calls console.warn in development', async () => {
      process.env.NODE_ENV = 'development';

      const { logger } = await import('@/lib/logger?dev-warn');

      logger.warn('heads up');

      expect(console.warn).toHaveBeenCalledOnce();
      const [firstArg] = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
      expect(firstArg).toContain('heads up');
    });
  });

  // -------------------------------------------------------------------------
  // logger must not throw for any input — including edge cases
  // -------------------------------------------------------------------------

  describe('robustness', () => {
    it('does not throw when called with an empty string message', async () => {
      const { logger } = await import('@/lib/logger');
      expect(() => logger.error('')).not.toThrow();
    });

    it('does not throw when called with undefined as extra arg', async () => {
      const { logger } = await import('@/lib/logger');
      expect(() => logger.error('msg', undefined)).not.toThrow();
    });

    it('does not throw when called with a null error object', async () => {
      const { logger } = await import('@/lib/logger');
      expect(() => logger.error('null error', null)).not.toThrow();
    });

    it('does not throw when called with a nested Error instance', async () => {
      const { logger } = await import('@/lib/logger');
      const err = new Error('inner error');
      expect(() => logger.error('wrapped', err)).not.toThrow();
    });

    it('logger.warn() does not throw for any input', async () => {
      const { logger } = await import('@/lib/logger');
      expect(() => logger.warn('warning', { code: 42 })).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Production mode — console methods must NOT be called.
  // The logger writes directly to process.stderr/stdout via process.stderr.write()
  // in production, so console.error and console.warn are never invoked.
  // -------------------------------------------------------------------------

  describe('in production mode', () => {
    it('logger.error() does not call console.error in production', async () => {
      process.env.NODE_ENV = 'production';

      const { logger } = await import('@/lib/logger?prod-error');

      logger.error('silent error');

      expect(console.error).not.toHaveBeenCalled();
    });

    it('logger.warn() does not call console.warn in production', async () => {
      process.env.NODE_ENV = 'production';

      const { logger } = await import('@/lib/logger?prod-warn');

      logger.warn('silent warning');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
