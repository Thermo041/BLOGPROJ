const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');
const validateId = require('../middlewares/validateObjectId');

router.use(isAdmin);
router.get('/dashboard', admin.dashboard);
router.get('/users', admin.users);
router.post('/users/:id/ban', validateId, admin.toggleBan);
router.get('/blogs', admin.blogs);
router.delete('/blogs/:id', validateId, admin.deleteBlog);
router.get('/comments', admin.comments);
router.delete('/comments/:id', validateId, admin.deleteComment);

module.exports = router;
