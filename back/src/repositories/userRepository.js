const db = require('../config/db');

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, org_id, full_name, gsm_number, email, profile_photo_url, status_message, presence_status, role, last_seen, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const searchUsers = async (org_id, query) => {
  const like = `%${query}%`;
  const [rows] = await db.query(
    `SELECT id, full_name, gsm_number, email, profile_photo_url, presence_status, status_message, role
     FROM users
     WHERE org_id = ? AND (full_name LIKE ? OR gsm_number LIKE ?)`,
    [org_id, like, like]
  );
  return rows;
};

const updateProfile = async (id, { full_name, profile_photo_url, status_message, presence_status }) => {
  await db.query(
    'UPDATE users SET full_name = COALESCE(?, full_name), profile_photo_url = COALESCE(?, profile_photo_url), status_message = COALESCE(?, status_message), presence_status = COALESCE(?, presence_status) WHERE id = ?',
    [full_name || null, profile_photo_url || null, status_message || null, presence_status || null, id]
  );
  return findById(id);
};

const updatePresence = async (id, presence_status) => {
  await db.query(
    'UPDATE users SET presence_status = ?, last_seen = NOW() WHERE id = ?',
    [presence_status, id]
  );
};

const createNotification = async (db_pool, { user_id, type, reference_id }) => {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  await db_pool.query(
    'INSERT INTO notifications (id, user_id, type, reference_id) VALUES (?, ?, ?, ?)',
    [id, user_id, type, reference_id || null]
  );
  return id;
};

const getNotifications = async (user_id) => {
  const [rows] = await db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [user_id]
  );
  return rows;
};

const markNotificationsRead = async (user_id) => {
  await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id]);
};

const getUnreadNotificationCount = async (user_id) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
    [user_id]
  );
  return rows[0].cnt;
};

module.exports = {
  findById, searchUsers, updateProfile, updatePresence,
  createNotification, getNotifications, markNotificationsRead, getUnreadNotificationCount,
};
