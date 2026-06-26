const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

exports.dashboard = async (req, res) => {
  const [totalUsers, publishedBlogs, draftBlogs, totalComments, popular] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    Blog.countDocuments({ status: 'draft' }),
    Comment.countDocuments(),
    Blog.findOne({ status: 'published' }).sort({ views: -1 }).populate('author', 'username')
  ]);
  res.render('admin/dashboard', {
    title: 'Admin dashboard',
    stats: { totalUsers, publishedBlogs, draftBlogs, totalComments, popular }
  });
};

exports.users = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Manage users', users });
};

exports.toggleBan = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && user.role !== 'admin') {
    user.isBanned = !user.isBanned;
    await user.save();
    req.flash('success', user.isBanned ? 'User banned' : 'User unbanned');
  }
  res.redirect('/admin/users');
};

exports.blogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author', 'username');
  res.render('admin/blogs', { title: 'Manage blogs', blogs });
};

exports.deleteBlog = async (req, res) => {
  await Comment.deleteMany({ blog: req.params.id });
  await Blog.findByIdAndDelete(req.params.id);
  req.flash('success', 'Blog deleted');
  res.redirect('/admin/blogs');
};

exports.comments = async (req, res) => {
  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username')
    .populate('blog', 'title slug');
  res.render('admin/comments', { title: 'Manage comments', comments });
};

exports.deleteComment = async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  req.flash('success', 'Comment deleted');
  res.redirect('/admin/comments');
};
