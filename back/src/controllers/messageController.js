const messageService = require('../services/messageService');
const { success, error } = require('../utils/response');

const sendMessage = async (req, res) => {
  try {
    const msg = await messageService.sendMessage(req.user, req.params.id, req.body);
    // WebSocket emit (socket.io instance app üzerinden erişilir)
    const io = req.app.get('io');
    if (io) io.to(req.params.id).emit('message:new', msg);
    return success(res, msg, 'Mesaj gönderildi', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const messages = await messageService.getMessages(req.user, req.params.id, page);
    return success(res, messages);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const editMessage = async (req, res) => {
  try {
    const msg = await messageService.editMessage(req.user, req.params.id, req.body.content);
    const io = req.app.get('io');
    if (io) io.to(msg.channel_id).emit('message:edit', msg);
    return success(res, msg, 'Mesaj güncellendi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const msg = await messageService.deleteMessage(req.user, req.params.id);
    const io = req.app.get('io');
    if (io) io.to(msg.channel_id).emit('message:delete', { id: msg.id, channel_id: msg.channel_id, content: 'Bu mesaj silindi' });
    return success(res, { id: msg.id }, 'Mesaj silindi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const search = async (req, res) => {
  try {
    const { q, channel_id } = req.query;
    const results = await messageService.searchMessages(req.user, q, channel_id || null);
    return success(res, results);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const reactToMessage = async (req, res) => {
  try {
    const reactions = await messageService.reactToMessage(req.user, req.params.id, req.body.emoji);
    const io = req.app.get('io');
    if (io) io.to(req.body.channel_id).emit('message:reaction', { message_id: req.params.id, reactions });
    return success(res, reactions);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const removeReaction = async (req, res) => {
  try {
    const reactions = await messageService.removeReaction(req.user, req.params.id, req.body.emoji);
    return success(res, reactions);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const pinMessage = async (req, res) => {
  try {
    const result = await messageService.pinMessage(req.user, req.params.channelId, req.params.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getPinnedMessages = async (req, res) => {
  try {
    const pinned = await messageService.getPinnedMessages(req.user, req.params.id);
    return success(res, pinned);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  sendMessage, getMessages, editMessage, deleteMessage, search,
  reactToMessage, removeReaction, pinMessage, getPinnedMessages,
};
