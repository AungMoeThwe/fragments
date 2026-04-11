// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const { query } = req.query;

    let fragments = await Fragment.byUser(req.user, expand);

    // If a search query is provided, filter fragments
    if (query && expand) {
      const q = query.toLowerCase();
      fragments = fragments.filter((fragment) => {
        return (
          fragment.type?.toLowerCase().includes(q) ||
          fragment.id?.toLowerCase().includes(q) ||
          fragment.size?.toString().includes(q)
        );
      });
    }

    logger.debug({ ownerId: req.user, expand, query }, 'GET /fragments');

    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'error getting fragments');
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
