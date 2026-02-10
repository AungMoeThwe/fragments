const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.email || req.user; 
    const fragment = await Fragment.byId(ownerId, req.params.id);
    const data = await fragment.getData();

    res.status(200).set('Content-Type', fragment.type).send(data);
  } catch {
    res.status(404).json(createErrorResponse(404, 'not found'));
  }
};
