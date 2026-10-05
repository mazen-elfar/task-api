const request = require('supertest');
const app = require('../src/app');

describe('Health and Documentation Endpoints', () => {
  it('GET /health - should return 200 and healthy server status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.uptime).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
  });

  it('GET / - should return 200 and root welcome payload', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documentation).toBe('/api-docs');
  });

  it('GET /api-docs.json - should serve valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('Task Management RESTful API');
    expect(res.body.paths['/api/tasks']).toBeDefined();
    expect(res.body.paths['/api/auth/register']).toBeDefined();
  });

  it('GET /non-existent-route - should return 404 with structured error response', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('does not exist on this server');
  });
});
