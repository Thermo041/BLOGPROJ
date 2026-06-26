const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Redirect authenticated users away from auth pages
function isGuest(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  next();
}

router.get('/register', isGuest, auth.getRegister);
router.post('/register', isGuest, auth.postRegister);
router.get('/login', isGuest, auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/logout', auth.logout);

module.exports = router;
