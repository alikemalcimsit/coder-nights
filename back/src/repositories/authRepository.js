const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findUserByGsm = async (gsm_number) => {
  
  const [rows] = await db.query('SELECT * FROM users WHERE gsm_number = ?', [gsm_number]);
  console.log('findUserByGsm - GSM:', gsm_number, 'Rows found:', rows.length);
  return rows[0] || null;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

const createUser = async ({ org_id, full_name, gsm_number, email, password_hash, role }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO users (id, org_id, full_name, gsm_number, email, password_hash, role, otp_verified) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
    [id, org_id, full_name, gsm_number, email || null, password_hash || null, role || 'EMPLOYEE']
  );
  return findUserById(id);
};

const markOtpVerified = async (user_id) => {
  await db.query('UPDATE users SET otp_verified = 1 WHERE id = ?', [user_id]);
};

const createOtp = async (gsm_number, otp_code, expires_at) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO otp_verifications (id, gsm_number, otp_code, expires_at) VALUES (?, ?, ?, ?)',
    [id, gsm_number, otp_code, expires_at]
  );
  return id;
};

const findValidOtp = async (gsm_number, otp_code) => {
  const [rows] = await db.query(
    'SELECT * FROM otp_verifications WHERE gsm_number = ? AND otp_code = ? AND verified = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [gsm_number, otp_code]
  );
  return rows[0] || null;
};

const markOtpUsed = async (otp_id) => {
  await db.query('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [otp_id]);
};

const saveSession = async (user_id, refresh_token, expires_at, ip_address, user_agent) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO user_sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, user_id, refresh_token, ip_address || null, user_agent || null, expires_at]
  );
  return id;
};

const findSession = async (refresh_token) => {
  const [rows] = await db.query(
    'SELECT * FROM user_sessions WHERE refresh_token = ? AND expires_at > NOW()',
    [refresh_token]
  );
  return rows[0] || null;
};

const deleteSession = async (refresh_token) => {
  await db.query('DELETE FROM user_sessions WHERE refresh_token = ?', [refresh_token]);
};

module.exports = {
  findUserByGsm, findUserByEmail, findUserById,
  createUser, markOtpVerified,
  createOtp, findValidOtp, markOtpUsed,
  saveSession, findSession, deleteSession,
};
