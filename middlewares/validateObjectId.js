const mongoose = require('mongoose');

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    if (req.accepts('json') && !req.accepts('html')) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    req.flash('error', 'Invalid request');
    return res.redirect('/blogs');
  }
  next();
};
