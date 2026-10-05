const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Sends a standardized success response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable status message
 * @param {*} [data=null] - Payload data
 * @param {Object} [meta=null] - Optional metadata (e.g., pagination)
 */
const sendSuccess = (res, statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {Array<Object>|null} [errors=null] - Array of specific error items
 */
const sendError = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message,
    errors: errors || [],
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
