const router = require('express').Router();
const ctrl = require('../controllers/organizationController');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/v1/org/invite-info?token= (auth gerekmez — kayıt öncesi bilgi alınır)
router.get('/invite-info', ctrl.getInviteInfo);

router.use(authenticate);

// GET /api/v1/org
router.get('/', ctrl.getOrganization);

// GET /api/v1/org/users
router.get('/users', ctrl.getUsers);

// POST /api/v1/org/invite
router.post('/invite', ctrl.inviteUser);

// GET /api/v1/org/accept-invite?token=
router.get('/accept-invite', ctrl.acceptInvite);

module.exports = router;
