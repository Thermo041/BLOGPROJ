const express = require('express');
const router = express.Router();
const blog = require('../controllers/blogController');
const comment = require('../controllers/commentController');
const profile = require('../controllers/profileController');
const isAuth = require('../middlewares/isAuthenticated');
const validateId = require('../middlewares/validateObjectId');
const { upload } = require('../config/cloudinary');

router.get('/', blog.home);
router.get('/blogs', blog.listBlogs);
router.get('/dashboard', isAuth, blog.dashboard);
router.get('/bookmarks', isAuth, blog.bookmarks);

router.get('/settings', isAuth, profile.getSettings);
router.post('/settings/profile', isAuth, upload.single('profilePic'), profile.updateProfile);
router.post('/settings/password', isAuth, profile.changePassword);

router.get('/blogs/create', isAuth, blog.getCreate);
router.post('/blogs/create', isAuth, upload.single('coverImage'), blog.postCreate);
router.get('/blogs/edit/:id', isAuth, validateId, blog.getEdit);
router.put('/blogs/edit/:id', isAuth, validateId, upload.single('coverImage'), blog.postEdit);
router.delete('/blogs/:id', isAuth, validateId, blog.deleteBlog);

router.get('/blogs/:id/views', validateId, blog.getViews);
router.post('/blogs/:id/like', isAuth, validateId, blog.toggleLike);
router.post('/blogs/:id/bookmark', isAuth, validateId, blog.toggleBookmark);
router.post('/blogs/:id/comment', isAuth, validateId, comment.addComment);
router.delete('/comments/:id', isAuth, validateId, comment.deleteComment);

router.get('/profile/:id', blog.profile);
router.get('/blogs/:slug', blog.showBlog);

module.exports = router;
