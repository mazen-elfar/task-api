module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 60000, // 60s timeout for downloading binary or slow connections
};
