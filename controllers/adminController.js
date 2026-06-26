const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');

exports.dashboard = async (req, res, next) => {
  try {
    const [totalUsers, publishedBlogs, draftBlogs, totalComments, popular] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Blog.findOne({ status: 'published' }).sort({ views: -1 }).populate('author', 'username profilePic')
    ]);
    res.render('admin/dashboard', {
      title: 'Admin dashboard',
      stats: { totalUsers, publishedBlogs, draftBlogs, totalComments, popular }
    });
  } catch (err) {
    next(err);
  }
};

exports.users = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage users', users });
  } catch (err) {
    next(err);
  }
};

exports.toggleBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    if (user.role !== 'admin') {
      user.isBanned = !user.isBanned;
      await user.save();
      req.flash('success', user.isBanned ? 'User banned' : 'User unbanned');
    } else {
      req.flash('error', 'Cannot ban an admin');
    }
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
};

exports.blogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author', 'username profilePic');
    res.render('admin/blogs', { title: 'Manage blogs', blogs });
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/admin/blogs');
    }
    await Comment.deleteMany({ blog: blog._id });
    await Bookmark.deleteMany({ blog: blog._id });
    await blog.deleteOne();
    req.flash('success', 'Blog deleted');
    res.redirect('/admin/blogs');
  } catch (err) {
    next(err);
  }
};

exports.comments = async (req, res, next) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('blog', 'title slug');
    res.render('admin/comments', { title: 'Manage comments', comments });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('/admin/comments');
    }
    await comment.deleteOne();
    req.flash('success', 'Comment deleted');
    res.redirect('/admin/comments');
  } catch (err) {
    next(err);
  }
};
