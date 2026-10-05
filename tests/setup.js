const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  // Ensure NODE_ENV is set to test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'super_secret_test_jwt_key_that_is_long_enough_for_security';
  process.env.JWT_EXPIRES_IN = '1h';

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
  });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Clear all database collections before each test run
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  // Cleanly disconnect and stop in-memory server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
