const userService = require('../services/userService');
const { success, error } = require('../utils/response');

const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return success(res, user, 'Profil güncellendi');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const searchUsers = async (req, res) => {
  try {
    const users = await userService.searchUsers(req.user, req.query.q);
    return success(res, users);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await userService.getNotifications(req.user.id);
    return success(res, notifications);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const result = await userService.markNotificationsRead(req.user.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getMe, updateProfile, searchUsers, getNotifications, markNotificationsRead };
