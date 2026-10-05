const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB instance using Mongoose.
 * Implements connection lifecycle event listeners for production reliability.
 *
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const uri = config.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the configuration environment.');
  }

  // Set mongoose options
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: config.NODE_ENV !== 'production', // Build indexes in dev, rely on migrations in prod for scale
    });

    logger.info(`MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

/**
 * Gracefully close the MongoDB connection.
 * Used during server shutdown and test cleanup.
 *
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    logger.error('Error during MongoDB disconnection:', error.message);
  }
};

// Lifecycle listeners
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime connection error:', err.message);
});

module.exports = {
  connectDB,
  disconnectDB,
};
