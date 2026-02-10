const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const { type } = contentType.parse(req);

    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json(createErrorResponse(400, 'body must be a Buffer'));
    }

    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.setData(req.body); // setData() already saves + updates size/updated

    // Build full Location URL
    const locationPath = `/v1/fragments/${fragment.id}`;

    const location =
      process.env.NODE_ENV === 'test'
        ? locationPath
        : new URL(locationPath, process.env.API_URL || `http://${req.headers.host}`).toString();

    res.status(201).set('Location', location).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
