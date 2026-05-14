const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Yetkilendirme gerekli', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Geçersiz veya süresi dolmuş token', 401);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'Bu işlem için yetkiniz yok', 403);
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
