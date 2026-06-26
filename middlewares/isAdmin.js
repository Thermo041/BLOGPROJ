module.exports = function (req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  req.flash('error', 'Admin access required');
  res.redirect('/');
};
