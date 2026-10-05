const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const config = require('../config/env');

/**
 * @desc    API Health check endpoint
 * @route   GET /health
 * @access  Public
 */
const checkHealth = (req, res) => {
  const healthData = {
    status: 'UP',
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  };

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'API is running and healthy.',
    healthData
  );
};

module.exports = {
  checkHealth,
};
