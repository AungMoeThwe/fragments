const request = require('supertest');
const app = require('../../src/app');

const AUTH = ['test-user1@fragments-testing.com', 'test-password1'];

describe('DELETE /v1/fragments/:id', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).delete('/v1/fragments/abc');
    expect(res.statusCode).toBe(401);
  });

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .auth(...AUTH);
    expect(res.statusCode).toBe(404);
  });

  test('returns 200 and deletes fragment', async () => {
    // Create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('to be deleted');
    expect(postRes.statusCode).toBe(201);
    const id = postRes.headers.location.split('/').pop();

    // Delete
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth(...AUTH);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });

  test('fragment is not accessible after deletion', async () => {
    // Create
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...AUTH)
      .set('Content-Type', 'text/plain')
      .send('delete me');
    expect(postRes.statusCode).toBe(201);
    const location = postRes.headers.location;
    const id = location.split('/').pop();

    // Delete
    await request(app).delete(`/v1/fragments/${id}`).auth(...AUTH);

    // Try to GET - should 404
    const getRes = await request(app).get(location).auth(...AUTH);
    expect(getRes.statusCode).toBe(404);
  });
});
