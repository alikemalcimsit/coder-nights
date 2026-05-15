const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', ctrl.getMe);

// PATCH /api/v1/users/me
router.patch('/me', ctrl.updateProfile);

// GET /api/v1/users/search?q=
router.get('/search', ctrl.searchUsers);

// GET /api/v1/users/notifications
router.get('/notifications', ctrl.getNotifications);

// PATCH /api/v1/users/notifications/read
router.patch('/notifications/read', ctrl.markNotificationsRead);

// POST /api/v1/users/notifications
router.post('/notifications', ctrl.createNotification);

module.exports = router;
