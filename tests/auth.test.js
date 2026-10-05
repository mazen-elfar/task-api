const request = require('supertest');
const app = require('../src/app');

describe('Authentication Endpoints (/api/auth)', () => {
  const validUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('User registered successfully');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.name).toBe(validUser.name);
      // Password MUST NOT be exposed
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return 409 Conflict when attempting to register an existing email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(validUser);

      // Duplicate attempt
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should return 400 Bad Request when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 Bad Request when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should return 400 Bad Request when password is under 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Password User',
          email: 'short@example.com',
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Seed user for login tests
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return 401 Unauthorized with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should return 401 Unauthorized with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should return 400 Bad Request when body is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
