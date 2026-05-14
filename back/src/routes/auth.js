const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/auth/register-admin  → Org + admin oluştur
router.post('/register-admin', ctrl.registerAdmin);

// POST /api/v1/auth/register  → Çalışan kaydı (org_id gerekli)
router.post('/register', ctrl.register);

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', ctrl.verifyOtp);

// POST /api/v1/auth/login  → Şifre ile giriş (OTP doğrulanmış hesaplar)
router.post('/login', ctrl.login);

// POST /api/v1/auth/refresh
router.post('/refresh', ctrl.refresh);

// POST /api/v1/auth/logout
router.post('/logout', ctrl.logout);

// POST /api/v1/auth/resend-otp
router.post('/resend-otp', ctrl.resendOtp);

module.exports = router;
