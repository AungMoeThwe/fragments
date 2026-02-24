// tests/unit/get-info.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('returns 401 without auth', () =>
    request(app).get('/v1/fragments/abc/info').expect(401));

  test('returns 404 for unknown fragment id (with valid auth)', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist/info')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test('returns 200 and fragment metadata for existing fragment', async () => {
    // 1) Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(postRes.statusCode).toBe(201);

    // Location is sometimes absolute (prod) or relative (tests). Handle both.
    const location = postRes.headers.location;
    expect(location).toBeTruthy();

    const url = new URL(location, 'http://localhost');
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    // 2) Fetch metadata
    const infoRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(infoRes.statusCode).toBe(200);
    expect(infoRes.headers['content-type']).toContain('application/json');

    // Response shape: { status:"ok", fragment:{...} } or { status:"ok", ... }
    expect(infoRes.body.status).toBe('ok');
    expect(infoRes.body.fragment).toBeTruthy();

    const frag = infoRes.body.fragment;
    expect(frag.id).toBe(id);
    expect(typeof frag.ownerId).toBe('string');
    expect(typeof frag.created).toBe('string');
    expect(typeof frag.updated).toBe('string');
    expect(frag.type).toBe('text/plain');
    expect(frag.size).toBe(5); // "hello" = 5 bytes
  });

  test('cannot access another user’s fragment metadata', async () => {
    // Create as user1
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(postRes.statusCode).toBe(201);
    const location = postRes.headers.location;
    const url = new URL(location, 'http://localhost');
    const id = url.pathname.split('/').pop();

    // Try to read /info as user2
    const infoRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('test-user2@fragments-testing.com', 'test-password2');

    expect(infoRes.statusCode).toBe(404);
    expect(infoRes.body.status).toBe('error');
    expect(infoRes.body.error.code).toBe(404);
  });
});
