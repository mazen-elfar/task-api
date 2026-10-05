const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  return sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    'User registered successfully.',
    result
  );
});

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'User logged in successfully.',
    result
  );
});

module.exports = {
  register,
  login,
};
