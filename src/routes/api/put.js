// src/routes/api/put.js

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const { id } = req.params;

  // Parse Content-Type
  let type;
  try {
    ({ type } = contentType.parse(req));
  } catch (err) {
    logger.warn({ err }, 'invalid or missing Content-Type header');
    return res.status(400).json(createErrorResponse(400, 'invalid content-type'));
  }

  // Must be a Buffer
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('request body was not parsed as Buffer');
    return res.status(400).json(createErrorResponse(400, 'body must be a Buffer'));
  }

  try {
    // Get the existing fragment
    const fragment = await Fragment.byId(ownerId, id);

    // Type must match existing fragment type
    if (fragment.mimeType !== type) {
      logger.warn({ existingType: fragment.mimeType, newType: type }, 'type mismatch');
      return res
        .status(400)
        .json(createErrorResponse(400, `fragment type cannot be changed from ${fragment.mimeType} to ${type}`));
    }

    // Update the data
    await fragment.setData(req.body);

    logger.info({ ownerId, id, type, size: fragment.size }, 'fragment updated');

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    if (String(err.message).toLowerCase().includes('not found')) {
      logger.warn({ ownerId, id }, 'fragment not found');
      return res.status(404).json(createErrorResponse(404, 'not found'));
    }
    logger.error({ err, ownerId, id }, 'error updating fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to process request'));
  }
};
