const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

exports.addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/blogs');
    }
    const text = (req.body.text || '').trim();
    if (!text) {
      req.flash('error', 'Comment cannot be empty');
      return res.redirect(`/blogs/${blog.slug}`);
    }
    await Comment.create({ user: req.user._id, blog: blog._id, text });
    req.flash('success', 'Comment added');
    res.redirect(`/blogs/${blog.slug}#comments`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add comment');
    res.redirect('/blogs');
  }
};

exports.deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate('blog', 'slug');
  if (!comment) {
    req.flash('error', 'Comment not found');
    return res.redirect('back');
  }
  if (String(comment.user) !== String(req.user._id) && req.user.role !== 'admin') {
    req.flash('error', 'Not authorized');
    return res.redirect('back');
  }
  const slug = comment.blog.slug;
  await comment.deleteOne();
  req.flash('success', 'Comment removed');
  res.redirect(`/blogs/${slug}#comments`);
};
