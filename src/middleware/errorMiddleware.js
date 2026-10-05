const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const config = require('../config/env');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid value '${err.value}' for field '${err.path}'.`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle MongoDB duplicate key errors (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `A record with ${field} '${value}' already exists.`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Handle Mongoose Schema Validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
};

/**
 * Handle JWT verification errors
 */
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);

/**
 * Handle JWT expiration errors
 */
const handleJWTExpiredError = () =>
  new AppError('Your authentication token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);

/**
 * Handle Malformed JSON payload
 */
const handleJSONParseError = () =>
  new AppError('Malformed JSON payload received.', HTTP_STATUS.BAD_REQUEST);

/**
 * Global error-handling middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;
  error.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Convert known error types to AppError
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) error = handleJSONParseError();

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isOperational = error.isOperational || false;

  // Log error details for server diagnostics
  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.debug(`[Operational Error ${statusCode}] ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  // Response payload format adhering strictly to standards:
  // { success: false, message: "...", errors: [...] }
  const response = {
    success: false,
    message: isOperational || statusCode < 500 ? error.message : 'Internal server error occurred.',
    errors: error.errors || [],
  };

  // Include stack trace only in development
  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found middleware for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`, HTTP_STATUS.NOT_FOUND));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
