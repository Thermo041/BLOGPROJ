const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');

router.use(isAdmin);
router.get('/dashboard', admin.dashboard);
router.get('/users', admin.users);
router.post('/users/:id/ban', admin.toggleBan);
router.get('/blogs', admin.blogs);
router.delete('/blogs/:id', admin.deleteBlog);
router.get('/comments', admin.comments);
router.delete('/comments/:id', admin.deleteComment);

module.exports = router;
