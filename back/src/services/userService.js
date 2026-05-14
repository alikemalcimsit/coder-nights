const userRepo = require('../repositories/userRepository');

const getMe = async (user_id) => {
  const user = await userRepo.findById(user_id);
  if (!user) throw { status: 404, message: 'Kullanıcı bulunamadı' };
  return user;
};

const updateProfile = async (user_id, data) => {
  return userRepo.updateProfile(user_id, data);
};

const searchUsers = async (user, query) => {
  if (!query || query.trim().length < 1) throw { status: 400, message: 'Arama terimi gerekli' };
  return userRepo.searchUsers(user.org_id, query.trim());
};

const getNotifications = async (user_id) => {
  return userRepo.getNotifications(user_id);
};

const markNotificationsRead = async (user_id) => {
  await userRepo.markNotificationsRead(user_id);
  return { message: 'Bildirimler okundu olarak işaretlendi' };
};

module.exports = { getMe, updateProfile, searchUsers, getNotifications, markNotificationsRead };
