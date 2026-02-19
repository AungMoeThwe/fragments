// src/routes/api/get-by-id.js 

const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user; // already hashed
  const id = req.params.id;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const data = await fragment.getData();

    logger.debug({ ownerId, id, type: fragment.type, size: fragment.size }, 'fragment fetched');

    return res.status(200).set('Content-Type', fragment.type).send(data);
  } catch (err) {
    if (String(err.message).toLowerCase().includes('not found')) {
      logger.warn({ ownerId, id }, 'fragment not found');
      return res.status(404).json(createErrorResponse(404, 'not found'));
    }

    logger.error({ err, ownerId, id }, 'error fetching fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to process request'));
  }
};
