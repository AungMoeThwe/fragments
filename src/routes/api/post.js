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
    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, apiUrl).toString();
    await fragment.save();
    await fragment.setData(req.body);

    res
      .status(201)
      .set('Location', location)
      .json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
