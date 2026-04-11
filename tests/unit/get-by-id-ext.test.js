// tests/unit/get-by-id-ext.test.js

const request = require('supertest');
const app = require('../../src/app');

const AUTH = ['test-user1@fragments-testing.com', 'test-password1'];

// Helper: create a fragment and return its id
async function createFragment(contentType, body) {
  const res = await request(app)
    .post('/v1/fragments')
    .auth(...AUTH)
    .set('Content-Type', contentType)
    .send(body);
  expect(res.statusCode).toBe(201);
  // location is like "/v1/fragments/<id>" in test env
  return res.headers.location.split('/').pop();
}

describe('GET /v1/fragments/:id.ext', () => {

  // --- Auth ---
  test('returns 401 without auth', () =>
    request(app).get('/v1/fragments/abc.html').expect(401));

  // --- 404 for unknown id ---
  test('returns 404 for a non-existent fragment id', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist.html')
      .auth(...AUTH);
    expect(res.statusCode).toBe(404);
  });

  // --- Unknown extension ---
  test('returns 415 for an unknown extension', async () => {
    const id = await createFragment('text/plain', 'hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.xyz`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(415);
  });

  // --- text/plain -> text/plain (no conversion, same type) ---
  test('returns text/plain fragment as text/plain with .txt extension', async () => {
    const id = await createFragment('text/plain', 'hello world');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toBe('hello world');
  });

  // --- text/markdown -> text/html ---
  test('converts a markdown fragment to html with .html extension', async () => {
    const id = await createFragment('text/markdown', '# Hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    // markdown-it wraps h1 in <h1> tags
    expect(res.text).toContain('<h1>Hello</h1>');
  });

  // --- text/markdown -> text/markdown (same type) ---
  test('returns markdown fragment as-is with .md extension', async () => {
    const id = await createFragment('text/markdown', '# Hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.md`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toBe('# Hello');
  });

  // --- text/markdown -> text/plain ---
  test('returns markdown fragment as plain text with .txt extension', async () => {
    const id = await createFragment('text/markdown', '# Hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  // --- unsupported conversion ---
  test('returns 415 when conversion is not supported for the fragment type', async () => {
    // text/plain cannot be converted to html
    const id = await createFragment('text/plain', 'hello');
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(415);
  });

  // --- application/json -> text/plain ---
  test('converts application/json fragment to plain text with .txt extension', async () => {
    const id = await createFragment('application/json', JSON.stringify({ key: 'value' }));
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  // --- application/json -> application/json (same type) ---
  test('returns json fragment as-is with .json extension', async () => {
    const payload = JSON.stringify({ key: 'value' });
    const id = await createFragment('application/json', payload);
    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

  // --- text/html -> text/plain ---
  test('returns html fragment as plain text with .txt extension', async () => {
    const id = await createFragment('text/html', '<h1>Hello</h1>');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  // --- text/csv -> text/plain ---
  test('returns csv fragment as plain text with .txt extension', async () => {
    const id = await createFragment('text/csv', 'name,age\nAung,25');
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  // --- text/csv -> application/json ---
  test('converts csv fragment to json', async () => {
    const id = await createFragment('text/csv', 'name,age\nAung,25');
    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(...AUTH);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

});
