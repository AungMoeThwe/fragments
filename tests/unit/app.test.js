const request = require('supertest');
const app = require('../../src/app');

describe('App 404 handler', () => {
  test('unknown routes return 404 error response', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });
});
