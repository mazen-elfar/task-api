const app = require('./src/app');
const config = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

let server;

// Start server function
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP Listener
    server = app.listen(config.PORT, () => {
      logger.info(
        `Server running in [${config.NODE_ENV}] mode on port: ${config.PORT}`
      );
      const isProduction = config.NODE_ENV === 'production';
      const baseUrl = isProduction
        ? (process.env.RENDER_EXTERNAL_URL || 'https://task-api-zvh4.onrender.com')
        : `http://localhost:${config.PORT}`;
      logger.info(`Swagger documentation available at: ${baseUrl}/api-docs`);
      logger.info(`Health check available at: ${baseUrl}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');

      // Disconnect database connection
      await disconnectDB();

      logger.info('Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Force close after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Listen for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // In production, consider graceful shutdown on unhandled rejections
});

// Listen for uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Launch server if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
