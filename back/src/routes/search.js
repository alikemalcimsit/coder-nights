const router = require('express').Router();
const msgCtrl = require('../controllers/messageController');
const userCtrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/search?q=X&type=messages|users&channel_id=
router.get('/', async (req, res) => {
  const { type } = req.query;
  if (type === 'users') {
    return userCtrl.searchUsers(req, res);
  }
  return msgCtrl.search(req, res);
});

module.exports = router;
