// src/routes/api/delete.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const { id } = req.params;

  try {
    await Fragment.delete(ownerId, id);
    logger.debug({ ownerId, id }, 'fragment deleted');
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.warn({ err, ownerId, id }, 'error deleting fragment');
    res.status(404).json(createErrorResponse(404, 'not found'));
  }
};
