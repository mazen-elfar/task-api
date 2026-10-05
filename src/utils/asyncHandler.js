/**
 * Wraps async route handlers and passes any unhandled rejected promises to Express next() error middleware.
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
