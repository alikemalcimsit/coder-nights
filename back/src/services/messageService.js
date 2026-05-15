const messageRepo = require('../repositories/messageRepository');
const channelRepo = require('../repositories/channelRepository');
const userRepo = require('../repositories/userRepository');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @mention parse
const parseMentions = (content) => {
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    mentions.push({ name: match[1], id: match[2] });
  }
  return mentions;
};

const sendMessage = async (user, channel_id, { content, message_type, reply_to_message_id, attachment }) => {
  const isMember = await channelRepo.isMember(channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };

  const message = await messageRepo.createMessage({
    channel_id,
    sender_id: user.id,
    content,
    message_type: message_type || 'TEXT',
    reply_to_message_id: reply_to_message_id || null,
  });

  // Dosya eki
  if (attachment) {
    await messageRepo.createAttachment({
      message_id: message.id,
      file_name: attachment.file_name,
      file_size: attachment.file_size,
      mime_type: attachment.mime_type || null,
      file_url: attachment.file_url || null,
      thumbnail_url: attachment.thumbnail_url || null,
    });
  }

  // Mention işleme
  if (content) {
    const mentions = parseMentions(content);
    for (const mention of mentions) {
      await messageRepo.createMention(message.id, mention.id);
      // Bildirim oluştur
      await db.query(
        "INSERT INTO notifications (id, user_id, type, reference_id) VALUES (UUID(), ?, 'MENTION', ?)",
        [mention.id, message.id]
      );
    }
  }

  // Full message with sender info
  const fullMessage = await messageRepo.findById(message.id);
  if (attachment) {
    fullMessage.attachments = await messageRepo.getAttachments(message.id);
  }

  return fullMessage;
};

const getMessages = async (user, channel_id, page = 1) => {
  const isMember = await channelRepo.isMember(channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };

  const messages = await messageRepo.getChannelMessages(channel_id, page);

  // En son mesajı okundu olarak işaretle
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    await messageRepo.upsertReadReceipt(user.id, channel_id, lastMsg.id);
  }

  return messages;
};

const editMessage = async (user, message_id, content) => {
  const msg = await messageRepo.findById(message_id);
  if (!msg) throw { status: 404, message: 'Mesaj bulunamadı' };
  if (msg.sender_id !== user.id) throw { status: 403, message: 'Sadece kendi mesajınızı düzenleyebilirsiniz' };
  if (msg.is_deleted) throw { status: 400, message: 'Silinmiş mesaj düzenlenemez' };

  return messageRepo.updateMessage(message_id, content);
};

const deleteMessage = async (user, message_id) => {
  const msg = await messageRepo.findById(message_id);
  if (!msg) throw { status: 404, message: 'Mesaj bulunamadı' };

  const memberRole = await channelRepo.getMemberRole(msg.channel_id, user.id);
  const canDelete = msg.sender_id === user.id || memberRole === 'CHANNEL_ADMIN' || user.role === 'ORG_ADMIN';
  if (!canDelete) throw { status: 403, message: 'Bu mesajı silme yetkiniz yok' };

  return messageRepo.softDeleteMessage(message_id);
};

const searchMessages = async (user, query, channel_id = null) => {
  if (!query || query.trim().length < 2) throw { status: 400, message: 'Arama terimi en az 2 karakter olmalı' };
  return messageRepo.searchMessages(user.org_id, query.trim(), channel_id);
};

const getUnreadCounts = async (user, channel_ids) => {
  const counts = {};
  for (const channel_id of channel_ids) {
    counts[channel_id] = await messageRepo.getUnreadCount(user.id, channel_id);
  }
  return counts;
};

const reactToMessage = async (user, message_id, emoji) => {
  const msg = await messageRepo.findById(message_id);
  if (!msg) throw { status: 404, message: 'Mesaj bulunamadı' };

  const isMember = await channelRepo.isMember(msg.channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };

  await messageRepo.addReaction(message_id, user.id, emoji);
  return messageRepo.getReactions(message_id);
};

const removeReaction = async (user, message_id, emoji) => {
  await messageRepo.removeReaction(message_id, user.id, emoji);
  return messageRepo.getReactions(message_id);
};

const pinMessage = async (user, channel_id, message_id) => {
  const channel = await channelRepo.findById(channel_id);
  if (!channel) throw { status: 404, message: 'Kanal bulunamadı' };

  const memberRole = await channelRepo.getMemberRole(channel_id, user.id);
  if (memberRole !== 'CHANNEL_ADMIN' && user.role !== 'ORG_ADMIN') {
    throw { status: 403, message: 'Sadece kanal yöneticisi mesaj sabitleyebilir' };
  }

  await messageRepo.pinMessage(channel_id, message_id, user.id);
  return { message: 'Mesaj sabitlendi' };
};

const getPinnedMessages = async (user, channel_id) => {
  const isMember = await channelRepo.isMember(channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };
  return messageRepo.getPinnedMessages(channel_id);
};

module.exports = {
  sendMessage, getMessages, editMessage, deleteMessage,
  searchMessages, getUnreadCounts,
  reactToMessage, removeReaction, pinMessage, getPinnedMessages,
};
