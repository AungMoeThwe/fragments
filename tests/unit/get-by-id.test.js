const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('returns 401 without auth', () => request(app).get('/v1/fragments/abc').expect(401));

  test('returns 200 and data for existing fragment', async () => {
    // create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(postRes.statusCode).toBe(201);
    const location = postRes.headers.location;

    // fetch fragment
    const getRes = await request(app)
      .get(location)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe('hello');
  });
});
