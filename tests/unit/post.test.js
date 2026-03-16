const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ test: true }));

    expect(res.statusCode).toBe(401);
  });

  test('creates application/json fragment', async () => {
    const data = { name: 'Aung', course: 'Cloud' };

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(data));

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBeDefined();
  });

  test('returns 415 for unsupported content type', async () => {
  const res = await request(app)
    .post('/v1/fragments')
    .auth('test-user1@fragments-testing.com', 'test-password1')
    .set('Content-Type', 'application/msword')
    .send('data');
  expect(res.statusCode).toBe(415);
});

test('returns 400 for invalid Content-Type header', async () => {
  const res = await request(app)
    .post('/v1/fragments')
    .auth('test-user1@fragments-testing.com', 'test-password1')
    .set('Content-Type', 'invalid-type')
    .send('hello');
  expect(res.statusCode).toBe(400);
});
});
