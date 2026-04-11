const request = require('supertest');
const app = require('../../src/app');

const AUTH = ['test-user1@fragments-testing.com', 'test-password1'];

describe('PUT /v1/fragments/:id', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app)
      .put('/v1/fragments/abc')
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(res.statusCode).toBe(401);
  });

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .put('/v1/fragments/does-not-exist')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(res.statusCode).toBe(404);
  });

  test('returns 200 and updates fragment data', async () => {
    // Create fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('original content');
    expect(postRes.statusCode).toBe(201);
    const id = postRes.headers.location.split('/').pop();

    // Update fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('updated content');
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.size).toBe(15);
  });

  test('returns 400 when trying to change fragment type', async () => {
    // Create text/plain fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(postRes.statusCode).toBe(201);
    const id = postRes.headers.location.split('/').pop();

    // Try to update with different type
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...AUTH)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ key: 'value' }));
    expect(putRes.statusCode).toBe(400);
  });

  test('updated content is retrievable via GET', async () => {
    // Create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('original');
    expect(postRes.statusCode).toBe(201);
    const location = postRes.headers.location;
    const id = location.split('/').pop();

    // Update
    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('updated');

    // GET and verify
    const getRes = await request(app)
      .get(location)
      .auth(...AUTH);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('updated');
  });
});
