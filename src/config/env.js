const dotenv = require('dotenv');
const path = require('path');

const fs = require('fs');

// Load .env file from project root if it exists
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const isTest = process.env.NODE_ENV === 'test';

// Define configuration with environment-derived or default values
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || (isTest ? '' : ''),
  JWT_SECRET: process.env.JWT_SECRET || (isTest ? 'test_jwt_secret_key_minimum_32_characters_for_tests' : ''),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

// Validate required environment variables in production and development (skip in test mode where test runners configure them)
if (!isTest) {
  const missing = [];

  if (!config.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }
  if (!config.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    console.error(
      `\x1b[31m[CONFIG ERROR] Missing required environment variable(s): ${missing.join(
        ', '
      )}. Please verify your .env file or deployment configuration.\x1b[0m`
    );
    // Don't immediately exit when imported during build scripts, but throw informative error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

module.exports = config;
