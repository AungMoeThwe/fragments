// src/routes/api/get-by-id-ext.js

const mime = require('mime-types');
const md = require('markdown-it')();
const sharp = require('sharp');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id; // Express already parsed this as "abc123"
  const ext = req.params.ext; // Express already parsed this as "html"

  // Convert extension to a mime type, e.g. "html" -> "text/html"
  const targetType = mime.lookup(ext); // no dot needed, mime-types handles both

  if (!targetType) {
    logger.warn({ ext }, 'unknown extension requested');
    return res.status(415).json(createErrorResponse(415, `unsupported extension: ${ext}`));
  }

  try {
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment.formats.includes(targetType)) {
      logger.warn(
        { fromType: fragment.mimeType, targetType },
        'unsupported type conversion requested'
      );
      return res
        .status(415)
        .json(createErrorResponse(415, `cannot convert ${fragment.mimeType} to ${targetType}`));
    }

    const data = await fragment.getData();

    // No conversion needed
    if (fragment.mimeType === targetType) {
      logger.debug({ ownerId, id, type: targetType }, 'serving fragment as-is');
      return res.status(200).set('Content-Type', fragment.type).send(data);
    }

    // text/markdown -> text/html
    if (fragment.mimeType === 'text/markdown' && targetType === 'text/html') {
      const html = md.render(data.toString());
      logger.debug({ ownerId, id }, 'converted markdown to html');
      return res.status(200).set('Content-Type', 'text/html').send(html);
    }

    // // any text/* -> text/plain
    // if (fragment.isText && targetType === 'text/plain') {
    //   logger.debug({ ownerId, id }, 'serving text fragment as plain text');
    //   return res.status(200).set('Content-Type', 'text/plain').send(data);
    // }

    // // application/json -> text/plain
    // if (fragment.mimeType === 'application/json' && targetType === 'text/plain') {
    //   logger.debug({ ownerId, id }, 'converting json to plain text');
    //   return res.status(200).set('Content-Type', 'text/plain').send(data.toString());
    // }

    // text/csv -> application/json
    if (fragment.mimeType === 'text/csv' && targetType === 'application/json') {
      const rows = data
        .toString()
        .trim()
        .split('\n')
        .map((row) => row.split(','));
      const headers = rows[0];
      const json = rows.slice(1).map((row) => {
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = row[i]?.trim();
          return obj;
        }, {});
      });
      return res.status(200).set('Content-Type', 'application/json').send(JSON.stringify(json));
    }

    // any text/* or application/json -> text/plain
    if (targetType === 'text/plain') {
      return res.status(200).set('Content-Type', 'text/plain').send(data.toString());
    }

    // image conversions using sharp
    const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    if (imageTypes.includes(fragment.mimeType) && imageTypes.includes(targetType)) {
      let sharpInstance = sharp(data);

      if (targetType === 'image/png') sharpInstance = sharpInstance.png();
      else if (targetType === 'image/jpeg') sharpInstance = sharpInstance.jpeg();
      else if (targetType === 'image/webp') sharpInstance = sharpInstance.webp();
      else if (targetType === 'image/gif') sharpInstance = sharpInstance.gif();
      else if (targetType === 'image/avif') sharpInstance = sharpInstance.avif();

      const converted = await sharpInstance.toBuffer();
      logger.debug({ ownerId, id, fromType: fragment.mimeType, targetType }, 'image converted');
      return res.status(200).set('Content-Type', targetType).send(converted);
    }

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
