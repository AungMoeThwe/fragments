// src/routes/api/get-by-id-ext.js

const path = require('path');
const mime = require('mime-types');
const md = require('markdown-it')();
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  // req.params.id will be something like "abc123.html"
  const raw = req.params.id;

  // Split into base id and extension, e.g. "abc123" and ".html"
  const ext = path.extname(raw);           // ".html"
  const id = path.basename(raw, ext);      // "abc123"

  // Convert extension to a mime type, e.g. ".html" -> "text/html"
  const targetType = mime.lookup(ext);     // "text/html" or false

  if (!targetType) {
    logger.warn({ ext }, 'unknown extension requested');
    return res.status(415).json(createErrorResponse(415, `unsupported extension: ${ext}`));
  }

  try {
    const fragment = await Fragment.byId(ownerId, id);

    // Check the conversion is supported
    if (!fragment.formats.includes(targetType)) {
      logger.warn(
        { fromType: fragment.mimeType, targetType },
        'unsupported type conversion requested'
      );
      return res
        .status(415)
        .json(
          createErrorResponse(
            415,
            `cannot convert ${fragment.mimeType} to ${targetType}`
          )
        );
    }

    const data = await fragment.getData();

    // If no conversion needed, return as-is
    if (fragment.mimeType === targetType) {
      logger.debug({ ownerId, id, type: targetType }, 'serving fragment as-is');
      return res.status(200).set('Content-Type', fragment.type).send(data);
    }

    // --- Conversions ---

    // text/markdown -> text/html
    if (fragment.mimeType === 'text/markdown' && targetType === 'text/html') {
      const html = md.render(data.toString());
      logger.debug({ ownerId, id }, 'converted markdown to html');
      return res.status(200).set('Content-Type', 'text/html').send(html);
    }

    // text/* -> text/plain (any text type can fall back to plain)
    if (fragment.isText && targetType === 'text/plain') {
      logger.debug({ ownerId, id }, 'serving text fragment as plain text');
      return res.status(200).set('Content-Type', 'text/plain').send(data);
    }

    // application/json -> text/plain
    if (fragment.mimeType === 'application/json' && targetType === 'text/plain') {
      logger.debug({ ownerId, id }, 'converting json to plain text');
      return res.status(200).set('Content-Type', 'text/plain').send(data.toString());
    }

    // Fallthrough — shouldn't happen if formats getter is correct
    logger.error({ fromType: fragment.mimeType, targetType }, 'conversion fell through');
    return res.status(415).json(createErrorResponse(415, 'unsupported conversion'));

  } catch (err) {
    if (String(err.message).toLowerCase().includes('not found')) {
      logger.warn({ ownerId, id }, 'fragment not found');
      return res.status(404).json(createErrorResponse(404, 'not found'));
    }

    logger.error({ err, ownerId, id }, 'error during fragment conversion');
    return res.status(500).json(createErrorResponse(500, 'unable to process request'));
  }
};
