/**
 * Structured application logger.
 * Suppresses info/debug logs during testing to keep test output clean.
 */
const isTest = process.env.NODE_ENV === 'test';

const logger = {
  info: (message, meta) => {
    if (!isTest) {
      const timestamp = new Date().toISOString();
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.log(`[${timestamp}] [INFO]: ${message}${metaStr}`);
    }
  },
  warn: (message, meta) => {
    if (!isTest) {
      const timestamp = new Date().toISOString();
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.warn(`[${timestamp}] [WARN]: ${message}${metaStr}`);
    }
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error?.stack || error || '';
    console.error(`[${timestamp}] [ERROR]: ${message}`, errorDetails);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.debug(`[${timestamp}] [DEBUG]: ${message}${metaStr}`);
    }
  },
};

module.exports = logger;
