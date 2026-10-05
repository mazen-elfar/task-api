const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const config = require('../config/env');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Generate signed JWT token.
 *
 * @param {string} userId
 * @param {string} email
 * @returns {string}
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Register a new user account.
 *
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const registerUser = async ({ name, email, password }) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', HTTP_STATUS.CONFLICT);
  }

  // Create new user (password will be hashed via pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id.toString(), user.email);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate existing user and generate token.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password field since it is omitted by default
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Generic message to avoid email enumeration
    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = generateToken(user._id.toString(), user.email);

  return {
    user: user.toJSON(),
    token,
  };
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
};
