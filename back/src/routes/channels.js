const router = require('express').Router();
const ctrl = require('../controllers/channelController');
const msgCtrl = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/channels         → Benim kanallarım
router.get('/', ctrl.getMyChannels);

// GET /api/v1/channels/public  → Herkese açık kanallar
router.get('/public', ctrl.getPublicChannels);

// POST /api/v1/channels        → Kanal oluştur
router.post('/', ctrl.createChannel);

// POST /api/v1/dm              → DM başlat
router.post('/dm', ctrl.startDm);

// GET /api/v1/channels/:id/members
router.get('/:id/members', ctrl.getMembers);

// POST /api/v1/channels/:id/join
router.post('/:id/join', ctrl.joinChannel);

// POST /api/v1/channels/:id/invite
router.post('/:id/invite', ctrl.inviteToChannel);

// DELETE /api/v1/channels/:id/members/:userId
router.delete('/:id/members/:userId', ctrl.removeMember);

// PATCH /api/v1/channels/:id/members/:userId/role
router.patch('/:id/members/:userId/role', ctrl.updateMemberRole);

// PATCH /api/v1/channels/:id/notification-preference
router.patch('/:id/notification-preference', ctrl.updateNotificationPreference);

// GET /api/v1/channels/:id/messages
router.get('/:id/messages', msgCtrl.getMessages);

// POST /api/v1/channels/:id/messages (REST fallback)
router.post('/:id/messages', msgCtrl.sendMessage);

// GET /api/v1/channels/:id/pinned
router.get('/:id/pinned', msgCtrl.getPinnedMessages);

// POST /api/v1/channels/:channelId/pin/:id
router.post('/:channelId/pin/:id', msgCtrl.pinMessage);

module.exports = router;
