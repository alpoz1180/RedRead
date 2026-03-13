export const logger = {
  error: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(msg, ...args);
    }
    // TODO: send to Sentry or similar in production
  },
  warn: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(msg, ...args);
    }
  },
};
