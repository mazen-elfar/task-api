const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const config = require('../src/config/env');

describe('Task Endpoints (/api/tasks)', () => {
  let tokenUserA;
  let tokenUserB;
  let userAId;
  let userBId;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!',
    });
    tokenUserA = resA.body.data.token;
    userAId = resA.body.data.user._id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!',
    });
    tokenUserB = resB.body.data.token;
    userBId = resB.body.data.user._id;
  });

  describe('Authorization Gatekeeping', () => {
    it('should return 401 Unauthorized when Authorization header is missing', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should return 401 Unauthorized with invalid or corrupted token', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid authentication token');
    });

    it('should return 401 Unauthorized with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: userAId, email: 'usera@example.com' },
        config.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });
  });

  describe('POST /api/tasks (Create Task)', () => {
    it('should successfully create a task with default status "pending"', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Complete assessment',
          description: 'Build production ready REST API with node and mongo',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe('Complete assessment');
      expect(res.body.data.description).toBe('Build production ready REST API with node and mongo');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
      expect(res.body.data.owner).toBe(userAId);
    });

    it('should create a task with explicitly defined status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Review codebase',
          description: 'Check security and error handling',
          status: 'in-progress',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('in-progress');
    });

    it('should return 400 Bad Request when title is missing or empty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: '',
          description: 'Missing title task',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('should create task successfully when description is omitted (defaults to empty string)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Only title task',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('');
    });

    it('should return 400 Bad Request when status is not in allowed enum', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Task with bad status',
          description: 'Some description',
          status: 'not-a-valid-status',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'status')).toBe(true);
    });
  });

  describe('GET /api/tasks (List Tasks)', () => {
    beforeEach(async () => {
      // Seed 3 tasks for User A
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task A1', description: 'Description A1', status: 'pending' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task A2', description: 'Description A2', status: 'in-progress' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task A3', description: 'Description A3', status: 'completed' });

      // Seed 1 task for User B
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ title: 'Task B1', description: 'Description B1', status: 'pending' });
    });

    it('should retrieve all tasks belonging to authenticated user with pagination meta', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.meta.total).toBe(3);
      expect(res.body.meta.page).toBe(1);
    });

    it('should filter tasks by status enum', async () => {
      const res = await request(app)
        .get('/api/tasks?status=in-progress')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Task A2');
    });

    it('should support pagination limit and page', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.totalPages).toBe(2);
      expect(res.body.meta.hasNextPage).toBe(true);
    });

    it('should retrieve empty list if no tasks match status filter', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(res.body.meta.total).toBe(0);
    });
  });

  describe('GET /api/tasks/:id (Get Task By ID)', () => {
    let taskA;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Inspectable Task', description: 'Detailed inspection' });
      taskA = res.body.data;
    });

    it('should retrieve task by valid ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(taskA._id);
      expect(res.body.data.title).toBe(taskA.title);
    });

    it('should return 400 Bad Request for malformed MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-mongo-id')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 404 Not Found for non-existent ObjectId', async () => {
      const nonExistentId = '66fe08e8b61e2a001fb1e999';
      const res = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Task not found');
    });
  });

  describe('PATCH /api/tasks/:id (Update Task)', () => {
    let taskA;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Original Title', description: 'Original Description', status: 'pending' });
      taskA = res.body.data;
    });

    it('should partially update task status', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.title).toBe('Original Title'); // Unmodified
    });

    it('should partially update title and description', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Updated Title', description: 'Updated Description' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('Updated Description');
    });

    it('should return 400 Bad Request when update body is completely empty', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request when updated status is invalid enum', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'archived' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 Not Found when updating non-existent task', async () => {
      const nonExistentId = '66fe08e8b61e2a001fb1e999';
      const res = await request(app)
        .patch(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id (Delete Task)', () => {
    let taskA;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task to Delete', description: 'Will be deleted soon' });
      taskA = res.body.data;
    });

    it('should successfully delete task and confirm with 200 OK', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Subsequent get must return 404
      const fetchRes = await request(app)
        .get(`/api/tasks/${taskA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(fetchRes.status).toBe(404);
    });

    it('should return 404 Not Found when deleting non-existent task', async () => {
      const nonExistentId = '66fe08e8b61e2a001fb1e999';
      const res = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Task Ownership & Multi-Tenant Security Isolation', () => {
    let taskUserA;

    beforeEach(async () => {
      // User A creates a private task
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: "User A's Secret Task",
          description: "Confidential task that User B should never access",
        });
      taskUserA = res.body.data;
    });

    it("should prevent User B from viewing User A's task (returns 404)", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskUserA._id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should ensure User B's task list does not include User A's tasks", async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it("should prevent User B from updating User A's task (returns 404)", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskUserA._id}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ title: 'Hacked by User B' });

      expect(res.status).toBe(404);

      // Verify task in DB was not modified
      const checkRes = await request(app)
        .get(`/api/tasks/${taskUserA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(checkRes.body.data.title).toBe("User A's Secret Task");
    });

    it("should prevent User B from deleting User A's task (returns 404)", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskUserA._id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);

      // Verify task still exists for User A
      const checkRes = await request(app)
        .get(`/api/tasks/${taskUserA._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(checkRes.status).toBe(200);
    });
  });
});
