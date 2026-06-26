const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

exports.getRegister = (req, res) => res.render('auth/register', { title: 'Create account' });

exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, confirm } = req.body;
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/register');
    }
    if (password !== confirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }] });
    if (exists) {
      req.flash('error', 'Username or email already in use');
      return res.redirect('/register');
    }
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ username: username.trim(), email: email.toLowerCase().trim(), password: hashed });
    req.flash('success', 'Account created. Welcome aboard, sign in to begin.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong creating your account');
    res.redirect('/register');
  }
};

exports.getLogin = (req, res) => res.render('auth/login', { title: 'Sign in' });

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', (info && info.message) || 'Login failed');
      return res.redirect('/login');
    }
    req.logIn(user, (e) => {
      if (e) return next(e);
      req.flash('success', `Welcome back, ${user.username}`);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Signed out');
    res.redirect('/');
  });
};
