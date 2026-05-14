const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const authRepo = require('../repositories/authRepository');
const orgRepo = require('../repositories/organizationRepository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
require('dotenv').config();

const OTP_CODE = process.env.OTP_CODE || '1234';
const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES) || 5;

const register = async ({ gsm_number, full_name, email, password, org_id, invite_token }) => {
  // invite_token varsa org_id'yi oradan çöz
  let resolvedOrgId = org_id;
  let invitation = null;

  if (invite_token) {
    invitation = await orgRepo.findInvitationByToken(invite_token);
    if (!invitation) throw { status: 400, message: 'Geçersiz veya süresi dolmuş davet linki' };
    resolvedOrgId = invitation.org_id;
  }

  if (!resolvedOrgId) throw { status: 400, message: 'org_id veya invite_token gerekli' };

  const existing = await authRepo.findUserByGsm(gsm_number);
  if (existing) throw { status: 409, message: 'Bu GSM numarası zaten kayıtlı' };

  const org = await orgRepo.findById(resolvedOrgId);
  if (!org) throw { status: 404, message: 'Organizasyon bulunamadı' };

  const password_hash = password ? await bcrypt.hash(password, 10) : null;

  const user = await authRepo.createUser({
    org_id: resolvedOrgId,
    full_name,
    gsm_number,
    email: email || null,
    password_hash,
    role: 'EMPLOYEE',
  });

  // Davet kullanıldıysa kabul edildi olarak işaretle
  if (invitation) {
    await orgRepo.acceptInvitation(invite_token);
  }

  const expires_at = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  await authRepo.createOtp(gsm_number, OTP_CODE, expires_at);

  return { user_id: user.id, message: `OTP gönderildi (simülasyon: ${OTP_CODE})` };
};

const registerAdmin = async ({ gsm_number, full_name, email, password, org_name, org_domain, org_logo }) => {
  const existing = await authRepo.findUserByGsm(gsm_number);
  if (existing) throw { status: 409, message: 'Bu GSM numarası zaten kayıtlı' };

  if (org_domain) {
    const domainExists = await orgRepo.findByDomain(org_domain);
    if (domainExists) throw { status: 409, message: 'Bu domain zaten kullanımda' };
  }

  // Geçici org_id ile user oluştur, sonra org ile güncelle
  const tempOrgId = uuidv4();
  const password_hash = password ? await bcrypt.hash(password, 10) : null;

  // Önce geçici bir org yarat (created_by NULL)
  const tempOrg = await orgRepo.createOrganization({
    name: org_name,
    logo_url: org_logo || null,
    domain: org_domain || null,
    created_by: null,
  });

  const user = await authRepo.createUser({
    org_id: tempOrg.id,
    full_name,
    gsm_number,
    email: email || null,
    password_hash,
    role: 'ORG_ADMIN',
  });

  // Org'un created_by'ını güncelle
  await orgRepo.updateUserOrg(user.id, tempOrg.id);
  const db = require('../config/db');
  await db.query('UPDATE organizations SET created_by = ? WHERE id = ?', [user.id, tempOrg.id]);

  const expires_at = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  await authRepo.createOtp(gsm_number, OTP_CODE, expires_at);

  return { user_id: user.id, org_id: tempOrg.id, message: `OTP gönderildi (simülasyon: ${OTP_CODE})` };
};

const verifyOtp = async ({ gsm_number, otp_code }, ip, userAgent) => {
  const otp = await authRepo.findValidOtp(gsm_number, otp_code);
  if (!otp) throw { status: 400, message: 'Geçersiz veya süresi dolmuş OTP' };

  await authRepo.markOtpUsed(otp.id);

  const user = await authRepo.findUserByGsm(gsm_number);
  if (!user) throw { status: 404, message: 'Kullanıcı bulunamadı' };

  await authRepo.markOtpVerified(user.id);

  const payload = { id: user.id, org_id: user.org_id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepo.saveSession(user.id, refreshToken, expiresAt, ip, userAgent);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      gsm_number: user.gsm_number,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      presence_status: user.presence_status,
      profile_photo_url: user.profile_photo_url,
    },
  };
};

const login = async ({ gsm_number, password }, ip, userAgent) => {
  const user = await authRepo.findUserByGsm(gsm_number);
  console.log('Login attempt for GSM:', gsm_number, 'User found:', !!user);
  if (!user) throw { status: 401, message: 'GSM numarası veya şifre hatalı' };
  if (!user.otp_verified) throw { status: 403, message: 'OTP doğrulaması tamamlanmamış' };
console.log('User OTP verified:', user.otp_verified);
  if (user.password_hash) {
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw { status: 401, message: 'GSM numarası veya şifre hatalı' };
  }

  const payload = { id: user.id, org_id: user.org_id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepo.saveSession(user.id, refreshToken, expiresAt, ip, userAgent);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      gsm_number: user.gsm_number,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      presence_status: user.presence_status,
      profile_photo_url: user.profile_photo_url,
    },
  };
};

const refreshTokens = async (refresh_token, ip, userAgent) => {
  const session = await authRepo.findSession(refresh_token);
  if (!session) throw { status: 401, message: 'Geçersiz refresh token' };

  let decoded;
  try {
    decoded = verifyRefreshToken(refresh_token);
  } catch {
    throw { status: 401, message: 'Süresi dolmuş refresh token' };
  }

  await authRepo.deleteSession(refresh_token);

  const user = await authRepo.findUserById(decoded.id);
  const payload = { id: user.id, org_id: user.org_id, role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepo.saveSession(user.id, newRefreshToken, expiresAt, ip, userAgent);

  return { access_token: newAccessToken, refresh_token: newRefreshToken };
};

const logout = async (refresh_token) => {
  await authRepo.deleteSession(refresh_token);
};

const resendOtp = async (gsm_number) => {
  const user = await authRepo.findUserByGsm(gsm_number);
  if (!user) throw { status: 404, message: 'Kullanıcı bulunamadı' };
  const expires_at = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  await authRepo.createOtp(gsm_number, OTP_CODE, expires_at);
  return { message: `OTP gönderildi (simülasyon: ${OTP_CODE})` };
};

module.exports = { register, registerAdmin, verifyOtp, login, refreshTokens, logout, resendOtp };
