const authService = require('../services/authService');
const { success, error } = require('../utils/response');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return success(res, result, 'Kayıt başarılı, OTP gönderildi', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const registerAdmin = async (req, res) => {
  try {
    const result = await authService.registerAdmin(req.body);
    return success(res, result, 'Organizasyon ve admin hesabı oluşturuldu', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    return success(res, result, 'Giriş başarılı');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body, req.ip, req.headers['user-agent']);
    return success(res, result, 'Giriş başarılı');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return error(res, 'Refresh token gerekli', 400);
    const result = await authService.refreshTokens(refresh_token, req.ip, req.headers['user-agent']);
    return success(res, result, 'Token yenilendi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) await authService.logout(refresh_token);
    return success(res, null, 'Çıkış yapıldı');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const resendOtp = async (req, res) => {
  try {
    const result = await authService.resendOtp(req.body.gsm_number);
    return success(res, result, 'OTP yeniden gönderildi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { register, registerAdmin, verifyOtp, login, refresh, logout, resendOtp };
