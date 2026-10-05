const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Higher-order middleware to validate request params, query, and body using Joi schemas.
 * Strips unknown fields and aggregates all validation errors with status 400.
 *
 * @param {Object} schema - Object containing optional params, query, and/or body Joi schemas
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  ['params', 'query', 'body'].forEach((location) => {
    if (schema[location]) {
      const { error, value } = schema[location].validate(req[location], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.') || location,
            message: detail.message.replace(/['"]/g, ''),
          });
        });
      } else {
        // Replace with validated and sanitized (unknown fields stripped) value
        req[location] = value;
      }
    }
  });

  if (errors.length > 0) {
    return next(
      new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, errors)
    );
  }

  return next();
};

module.exports = validate;
