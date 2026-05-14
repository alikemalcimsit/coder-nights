const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createChannel = async ({ org_id, name, description, icon_url, type, created_by }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO channels (id, org_id, name, description, icon_url, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, org_id, name, description || null, icon_url || null, type, created_by]
  );
  return findById(id);
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM channels WHERE id = ?', [id]);
  return rows[0] || null;
};

const getUserChannels = async (user_id, org_id) => {
  const [rows] = await db.query(
    `SELECT c.*, cm.role AS member_role, cm.notification_preference
     FROM channels c
     JOIN channel_members cm ON c.id = cm.channel_id
     WHERE cm.user_id = ? AND c.org_id = ? AND c.is_archived = 0
     ORDER BY c.created_at ASC`,
    [user_id, org_id]
  );
  return rows;
};

const getPublicChannels = async (org_id) => {
  const [rows] = await db.query(
    'SELECT * FROM channels WHERE org_id = ? AND type = "PUBLIC" AND is_archived = 0',
    [org_id]
  );
  return rows;
};

const isMember = async (channel_id, user_id) => {
  const [rows] = await db.query(
    'SELECT id FROM channel_members WHERE channel_id = ? AND user_id = ?',
    [channel_id, user_id]
  );
  return rows.length > 0;
};

const addMember = async (channel_id, user_id, role = 'MEMBER') => {
  const id = uuidv4();
  await db.query(
    'INSERT IGNORE INTO channel_members (id, channel_id, user_id, role) VALUES (?, ?, ?, ?)',
    [id, channel_id, user_id, role]
  );
};

const removeMember = async (channel_id, user_id) => {
  await db.query('DELETE FROM channel_members WHERE channel_id = ? AND user_id = ?', [channel_id, user_id]);
};

const getMemberRole = async (channel_id, user_id) => {
  const [rows] = await db.query(
    'SELECT role FROM channel_members WHERE channel_id = ? AND user_id = ?',
    [channel_id, user_id]
  );
  return rows[0]?.role || null;
};

const getMembers = async (channel_id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.profile_photo_url, u.presence_status, u.status_message, cm.role
     FROM channel_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.channel_id = ?`,
    [channel_id]
  );
  return rows;
};

const findDmBetween = async (user1_id, user2_id, org_id) => {
  const [rows] = await db.query(
    `SELECT c.* FROM channels c
     JOIN channel_members cm1 ON c.id = cm1.channel_id AND cm1.user_id = ?
     JOIN channel_members cm2 ON c.id = cm2.channel_id AND cm2.user_id = ?
     WHERE c.type = 'DM' AND c.org_id = ?
     LIMIT 1`,
    [user1_id, user2_id, org_id]
  );
  return rows[0] || null;
};

const updateMemberRole = async (channel_id, user_id, role) => {
  await db.query(
    'UPDATE channel_members SET role = ? WHERE channel_id = ? AND user_id = ?',
    [role, channel_id, user_id]
  );
};

const updateNotificationPreference = async (channel_id, user_id, preference) => {
  await db.query(
    'UPDATE channel_members SET notification_preference = ? WHERE channel_id = ? AND user_id = ?',
    [preference, channel_id, user_id]
  );
};

const archiveChannel = async (channel_id) => {
  await db.query('UPDATE channels SET is_archived = 1 WHERE id = ?', [channel_id]);
};

module.exports = {
  createChannel, findById, getUserChannels, getPublicChannels,
  isMember, addMember, removeMember, getMemberRole, getMembers,
  findDmBetween, updateNotificationPreference, updateMemberRole, archiveChannel,
};
