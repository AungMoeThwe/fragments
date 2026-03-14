// src/routes/api/get-info.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug({ ownerId: req.user, id: req.params.id }, 'fragment info');

    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
  } catch (err) {
    logger.warn({ err, ownerId: req.user, id: req.params.id }, 'fragment info not found');
    res.status(404).json(createErrorResponse(404, 'not found'));
  }
};
