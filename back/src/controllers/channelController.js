const channelService = require('../services/channelService');
const { success, error } = require('../utils/response');

const createChannel = async (req, res) => {
  try {
    const channel = await channelService.createChannel(req.user, req.body);
    return success(res, channel, 'Kanal oluşturuldu', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMyChannels = async (req, res) => {
  try {
    const channels = await channelService.getMyChannels(req.user);
    return success(res, channels);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getPublicChannels = async (req, res) => {
  try {
    const channels = await channelService.getPublicChannels(req.user);
    return success(res, channels);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const joinChannel = async (req, res) => {
  try {
    const result = await channelService.joinChannel(req.user, req.params.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const inviteToChannel = async (req, res) => {
  try {
    const result = await channelService.inviteToChannel(req.user, req.params.id, req.body.user_id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const removeMember = async (req, res) => {
  try {
    const result = await channelService.removeMember(req.user, req.params.id, req.params.userId);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const startDm = async (req, res) => {
  try {
    const channel = await channelService.startDm(req.user, req.body.target_user_id);
    return success(res, channel, 'DM başlatıldı', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await channelService.getChannelMembers(req.user, req.params.id);
    return success(res, members);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateNotificationPreference = async (req, res) => {
  try {
    const result = await channelService.updateNotificationPreference(req.user, req.params.id, req.body.preference);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  createChannel, getMyChannels, getPublicChannels,
  joinChannel, inviteToChannel, removeMember,
  startDm, getMembers, updateNotificationPreference,
};
