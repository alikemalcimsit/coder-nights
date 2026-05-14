const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const PAGE_SIZE = 30;

const createMessage = async ({ channel_id, sender_id, content, message_type, reply_to_message_id }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO messages (id, channel_id, sender_id, content, message_type, reply_to_message_id) VALUES (?, ?, ?, ?, ?, ?)',
    [id, channel_id, sender_id, content || null, message_type || 'TEXT', reply_to_message_id || null]
  );
  return findById(id);
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT m.*,
       u.full_name AS sender_name, u.profile_photo_url AS sender_photo, u.presence_status AS sender_status,
       rm.content AS reply_content, ru.full_name AS reply_sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
     LEFT JOIN users ru ON rm.sender_id = ru.id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const getChannelMessages = async (channel_id, page = 1) => {
  const offset = (page - 1) * PAGE_SIZE;
  const [rows] = await db.query(
    `SELECT m.*,
       u.full_name AS sender_name, u.profile_photo_url AS sender_photo,
       rm.content AS reply_content, ru.full_name AS reply_sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
     LEFT JOIN users ru ON rm.sender_id = ru.id
     WHERE m.channel_id = ?
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [channel_id, PAGE_SIZE, offset]
  );
  return rows.reverse();
};

const updateMessage = async (id, content) => {
  await db.query('UPDATE messages SET content = ?, is_edited = 1 WHERE id = ?', [content, id]);
  return findById(id);
};

const softDeleteMessage = async (id) => {
  await db.query(
    'UPDATE messages SET is_deleted = 1, content = "Bu mesaj silindi", deleted_at = NOW() WHERE id = ?',
    [id]
  );
  return findById(id);
};

const createAttachment = async ({ message_id, file_name, file_size, mime_type, file_url, thumbnail_url }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO message_attachments (id, message_id, file_name, file_size, mime_type, file_url, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, message_id, file_name, file_size, mime_type || null, file_url || null, thumbnail_url || null]
  );
  return id;
};

const getAttachments = async (message_id) => {
  const [rows] = await db.query('SELECT * FROM message_attachments WHERE message_id = ?', [message_id]);
  return rows;
};

const createMention = async (message_id, mentioned_user_id) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO message_mentions (id, message_id, mentioned_user_id) VALUES (?, ?, ?)',
    [id, message_id, mentioned_user_id]
  );
};

const searchMessages = async (org_id, query, channel_id = null) => {
  let sql = `
    SELECT m.*, u.full_name AS sender_name, u.profile_photo_url AS sender_photo,
           c.name AS channel_name, c.type AS channel_type
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    JOIN channels c ON m.channel_id = c.id
    WHERE c.org_id = ? AND m.is_deleted = 0
    AND MATCH(m.content) AGAINST(? IN BOOLEAN MODE)
  `;
  const params = [org_id, `*${query}*`];

  if (channel_id) {
    sql += ' AND m.channel_id = ?';
    params.push(channel_id);
  }

  sql += ' ORDER BY m.created_at DESC LIMIT 50';
  const [rows] = await db.query(sql, params);
  return rows;
};

const getUnreadCount = async (user_id, channel_id) => {
  const [receipt] = await db.query(
    'SELECT last_read_message_id FROM read_receipts WHERE user_id = ? AND channel_id = ?',
    [user_id, channel_id]
  );

  if (!receipt[0] || !receipt[0].last_read_message_id) {
    const [count] = await db.query(
      'SELECT COUNT(*) AS cnt FROM messages WHERE channel_id = ? AND sender_id != ? AND is_deleted = 0',
      [channel_id, user_id]
    );
    return count[0].cnt;
  }

  const [count] = await db.query(
    `SELECT COUNT(*) AS cnt FROM messages
     WHERE channel_id = ? AND sender_id != ? AND is_deleted = 0
     AND created_at > (SELECT created_at FROM messages WHERE id = ?)`,
    [channel_id, user_id, receipt[0].last_read_message_id]
  );
  return count[0].cnt;
};

const upsertReadReceipt = async (user_id, channel_id, message_id) => {
  await db.query(
    `INSERT INTO read_receipts (id, user_id, channel_id, last_read_message_id, last_read_at)
     VALUES (UUID(), ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE last_read_message_id = ?, last_read_at = NOW()`,
    [user_id, channel_id, message_id, message_id]
  );
};

const addReaction = async (message_id, user_id, emoji) => {
  const id = uuidv4();
  await db.query(
    'INSERT IGNORE INTO message_reactions (id, message_id, user_id, emoji) VALUES (?, ?, ?, ?)',
    [id, message_id, user_id, emoji]
  );
};

const removeReaction = async (message_id, user_id, emoji) => {
  await db.query(
    'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
    [message_id, user_id, emoji]
  );
};

const getReactions = async (message_id) => {
  const [rows] = await db.query(
    `SELECT emoji, COUNT(*) AS count, GROUP_CONCAT(u.full_name) AS users
     FROM message_reactions mr JOIN users u ON mr.user_id = u.id
     WHERE mr.message_id = ?
     GROUP BY emoji`,
    [message_id]
  );
  return rows;
};

const pinMessage = async (channel_id, message_id, pinned_by) => {
  const id = uuidv4();
  await db.query(
    'INSERT IGNORE INTO pinned_messages (id, channel_id, message_id, pinned_by) VALUES (?, ?, ?, ?)',
    [id, channel_id, message_id, pinned_by]
  );
};

const getPinnedMessages = async (channel_id) => {
  const [rows] = await db.query(
    `SELECT pm.*, m.content, u.full_name AS sender_name, pu.full_name AS pinned_by_name
     FROM pinned_messages pm
     JOIN messages m ON pm.message_id = m.id
     JOIN users u ON m.sender_id = u.id
     JOIN users pu ON pm.pinned_by = pu.id
     WHERE pm.channel_id = ?
     ORDER BY pm.created_at DESC`,
    [channel_id]
  );
  return rows;
};

module.exports = {
  createMessage, findById, getChannelMessages,
  updateMessage, softDeleteMessage,
  createAttachment, getAttachments,
  createMention, searchMessages,
  getUnreadCount, upsertReadReceipt,
  addReaction, removeReaction, getReactions,
  pinMessage, getPinnedMessages,
};
