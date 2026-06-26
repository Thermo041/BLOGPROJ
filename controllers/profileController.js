const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getSettings = (req, res) => res.render('dashboard/settings', { title: 'Settings' });

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.bio = req.body.bio || '';
    if (req.body.username && req.body.username.trim() !== user.username) {
      const taken = await User.findOne({ username: req.body.username.trim() });
      if (taken) {
        req.flash('error', 'Username already taken');
        return res.redirect('/settings');
      }
      user.username = req.body.username.trim();
    }
    if (req.file) user.profilePic = req.file.path;
    await user.save();
    req.flash('success', 'Profile updated');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update profile');
    res.redirect('/settings');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current, password, confirm } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(current, user.password);
    if (!match) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/settings');
    }
    if (!password || password.length < 6) {
      req.flash('error', 'New password must be at least 6 characters');
      return res.redirect('/settings');
    }
    if (password !== confirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/settings');
    }
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    req.flash('success', 'Password changed');
    res.redirect('/settings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not change password');
    res.redirect('/settings');
  }
};
