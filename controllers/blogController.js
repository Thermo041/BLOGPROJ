const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

const CATEGORIES = ['Technology', 'Programming', 'AI', 'Web Development', 'DSA', 'Career'];
exports.CATEGORIES = CATEGORIES;

exports.home = async (req, res) => {
  const featured = await Blog.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(3)
    .populate('author', 'username profilePic');
  const latest = await Blog.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('author', 'username profilePic');
  res.render('blogs/home', { title: 'BlogSphere', featured, latest, categories: CATEGORIES });
};

exports.listBlogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 9;
  const { search, category, sort } = req.query;
  const filter = { status: 'published' };
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (category) filter.category = category;

  let sortObj = { createdAt: -1 };
  if (sort === 'liked') sortObj = { 'likesCount': -1, createdAt: -1 };
  if (sort === 'viewed') sortObj = { views: -1 };

  const query = Blog.find(filter).populate('author', 'username profilePic');
  if (sort === 'liked') query.sort({ createdAt: -1 });
  else query.sort(sortObj);

  let blogs = await query.skip((page - 1) * limit).limit(limit);
  if (sort === 'liked') {
    blogs = await Blog.find(filter)
      .populate('author', 'username profilePic')
      .lean();
    blogs.sort((a, b) => (b.likes.length - a.likes.length) || (b.createdAt - a.createdAt));
    blogs = blogs.slice((page - 1) * limit, page * limit);
  }
  const total = await Blog.countDocuments(filter);
  res.render('blogs/list', {
    title: 'Explore blogs',
    blogs,
    categories: CATEGORIES,
    current: { search: search || '', category: category || '', sort: sort || 'latest' },
    page,
    totalPages: Math.ceil(total / limit)
  });
};

exports.showBlog = async (req, res) => {
  let blog = await Blog.findOne({ slug: req.params.slug }).populate(
    'author',
    'username profilePic bio'
  );
  if (!blog) {
    req.flash('error', 'Blog not found');
    return res.redirect('/blogs');
  }
  if (blog.status === 'draft' && (!req.user || String(blog.author._id) !== String(req.user._id))) {
    req.flash('error', 'This blog is not available');
    return res.redirect('/blogs');
  }
  const isAuthor = req.user && String(blog.author._id) === String(req.user._id);
  if (blog.status === 'published' && !isAuthor) {
    blog = await Blog.findByIdAndUpdate(
      blog._id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username profilePic bio');
  }
  const comments = await Comment.find({ blog: blog._id })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePic');
  let bookmarked = false;
  if (req.user) {
    bookmarked = !!(await Bookmark.findOne({ user: req.user._id, blog: blog._id }));
  }
  const related = await Blog.find({
    category: blog.category,
    status: 'published',
    _id: { $ne: blog._id }
  })
    .limit(3)
    .populate('author', 'username');
  res.render('blogs/show', { title: blog.title, blog, comments, bookmarked, related });
};

exports.getCreate = (req, res) =>
  res.render('blogs/create', { title: 'Write a story', categories: CATEGORIES });

exports.postCreate = async (req, res) => {
  try {
    const { title, description, content, category, tags, status } = req.body;
    const blog = new Blog({
      title,
      description,
      content,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      status: status === 'published' ? 'published' : 'draft',
      author: req.user._id
    });
    if (req.file) blog.coverImage = req.file.path;
    await blog.save();
    req.flash('success', status === 'published' ? 'Blog published' : 'Draft saved');
    res.redirect(status === 'published' ? `/blogs/${blog.slug}` : '/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not create blog. Check the fields and try again.');
    res.redirect('/blogs/create');
  }
};

exports.getEdit = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash('error', 'Blog not found');
    return res.redirect('/dashboard');
  }
  if (String(blog.author) !== String(req.user._id) && req.user.role !== 'admin') {
    req.flash('error', 'Not authorized');
    return res.redirect('/dashboard');
  }
  res.render('blogs/edit', { title: 'Edit story', blog, categories: CATEGORIES });
};

exports.postEdit = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/dashboard');
    }
    if (String(blog.author) !== String(req.user._id) && req.user.role !== 'admin') {
      req.flash('error', 'Not authorized');
      return res.redirect('/dashboard');
    }
    const { title, description, content, category, tags, status } = req.body;
    blog.title = title;
    blog.description = description;
    blog.content = content;
    blog.category = category;
    blog.tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    blog.status = status === 'published' ? 'published' : 'draft';
    if (req.file) blog.coverImage = req.file.path;
    await blog.save();
    req.flash('success', 'Blog updated');
    res.redirect(blog.status === 'published' ? `/blogs/${blog.slug}` : '/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update blog');
    res.redirect('/dashboard');
  }
};

exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash('error', 'Blog not found');
    return res.redirect('/dashboard');
  }
  if (String(blog.author) !== String(req.user._id) && req.user.role !== 'admin') {
    req.flash('error', 'Not authorized');
    return res.redirect('/dashboard');
  }
  await Comment.deleteMany({ blog: blog._id });
  await Bookmark.deleteMany({ blog: blog._id });
  await blog.deleteOne();
  req.flash('success', 'Blog deleted');
  res.redirect('/dashboard');
};

exports.getViews = async (req, res) => {
  const blog = await Blog.findById(req.params.id).select('views');
  if (!blog) return res.status(404).json({ error: 'Not found' });
  res.json({ views: blog.views });
};

exports.toggleLike = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ error: 'Not found' });
  const idx = blog.likes.findIndex((u) => String(u) === String(req.user._id));
  if (idx === -1) blog.likes.push(req.user._id);
  else blog.likes.splice(idx, 1);
  await blog.save();
  res.json({ liked: idx === -1, count: blog.likes.length });
};

exports.toggleBookmark = async (req, res) => {
  const existing = await Bookmark.findOne({ user: req.user._id, blog: req.params.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }
  await Bookmark.create({ user: req.user._id, blog: req.params.id });
  res.json({ bookmarked: true });
};

exports.bookmarks = async (req, res) => {
  const items = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'blog', populate: { path: 'author', select: 'username profilePic' } });
  const blogs = items.map((i) => i.blog).filter(Boolean);
  res.render('blogs/bookmarks', { title: 'Your bookmarks', blogs });
};

exports.dashboard = async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id }).sort({ updatedAt: -1 });
  const published = blogs.filter((b) => b.status === 'published');
  const drafts = blogs.filter((b) => b.status === 'draft');
  const totalViews = published.reduce((s, b) => s + b.views, 0);
  const totalLikes = published.reduce((s, b) => s + b.likes.length, 0);
  res.render('dashboard/dashboard', {
    title: 'Your dashboard',
    published,
    drafts,
    stats: { totalViews, totalLikes, count: blogs.length }
  });
};

exports.profile = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash('error', 'User not found');
    return res.redirect('/');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'User not found');
    return res.redirect('/');
  }
  const blogs = await Blog.find({ author: user._id, status: 'published' }).sort({ createdAt: -1 });
  res.render('blogs/profile', { title: user.username, profileUser: user, blogs });
};
