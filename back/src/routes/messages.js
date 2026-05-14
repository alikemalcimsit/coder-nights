const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// PATCH /api/v1/messages/:id
router.patch('/:id', ctrl.editMessage);

// DELETE /api/v1/messages/:id
router.delete('/:id', ctrl.deleteMessage);

// POST /api/v1/messages/:id/reactions
router.post('/:id/reactions', ctrl.reactToMessage);

// DELETE /api/v1/messages/:id/reactions
router.delete('/:id/reactions', ctrl.removeReaction);

// GET /api/v1/search
router.get('/search', ctrl.search);

module.exports = router;
