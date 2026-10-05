const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const config = require('../config/env');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Protect routes by verifying JWT Bearer token and attaching the user object to req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError(
          'Authentication required. Please provide a Bearer token in the Authorization header.',
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(
        new AppError('Authentication token is missing.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(
          new AppError('Authentication token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED)
        );
      }
      return next(
        new AppError('Invalid authentication token. Please log in again.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Verify user still exists in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
