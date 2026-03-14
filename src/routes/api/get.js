// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // expand=1 returns full fragment objects
    const expand = req.query.expand === '1';

    const fragments = await Fragment.byUser(req.user, expand);

    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
