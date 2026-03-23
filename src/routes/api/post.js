// src/routes/api/post.js

const contentType = require('content-type');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  let type;

  // 1) Parse Content-Type safely
  try {
    ({ type } = contentType.parse(req));
  } catch (err) {
    logger.warn({ err }, 'invalid or missing Content-Type header');
    return res.status(400).json(createErrorResponse(400, 'invalid content-type'));
  }

  // 2) Validate supported type
  if (!Fragment.isSupportedType(type)) {
    logger.warn({ type }, 'unsupported media type');
    return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
  }

  // 3) Ensure body is a Buffer (raw body parser should set this)
  if (!Buffer.isBuffer(req.body)) {
    logger.warn({ parsed: typeof req.body }, 'request body was not parsed as Buffer');
    return res.status(400).json(createErrorResponse(400, 'body must be a Buffer'));
  }

  const ownerId = req.user; // already hashed by auth-middleware

  try {
    // 4) Create + store fragment
    const fragment = new Fragment({ ownerId, type: req.headers['content-type'] });

    // setData() should write data + update size + save metadata
    await fragment.setData(req.body);

    // 5) Location header
    const locationPath = `/v1/fragments/${fragment.id}`;

    // In tests, supertest expects a relative path (it can't fetch absolute URLs)
    const location =
      process.env.NODE_ENV === 'test'
        ? locationPath
        : new URL(locationPath, process.env.API_URL || `http://${req.headers.host}`).toString();

    logger.info(
      { ownerId, id: fragment.id, type: fragment.type, size: fragment.size, location },
      'fragment created'
    );

    return res.status(201).set('Location', location).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err, ownerId, type }, 'error creating fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to process request'));
  }
};
