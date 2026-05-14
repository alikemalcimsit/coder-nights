const channelRepo = require('../repositories/channelRepository');
const orgRepo = require('../repositories/organizationRepository');
const { v4: uuidv4 } = require('uuid');

const createChannel = async (user, { name, description, icon_url, type }) => {
  if (type === 'DM') throw { status: 400, message: 'DM kanalı bu endpoint ile oluşturulamaz' };

  if (type === 'PRIVATE' && user.role === 'EMPLOYEE') {
    throw { status: 403, message: 'Sadece Org Admin private kanal oluşturabilir' };
  }

  const channel = await channelRepo.createChannel({
    org_id: user.org_id,
    name,
    description,
    icon_url,
    type,
    created_by: user.id,
  });

  // Oluşturan kişiyi CHANNEL_ADMIN olarak ekle
  await channelRepo.addMember(channel.id, user.id, 'CHANNEL_ADMIN');

  return channel;
};

const getMyChannels = async (user) => {
  const channels = await channelRepo.getUserChannels(user.id, user.org_id);
  return channels;
};

const joinChannel = async (user, channel_id) => {
  const channel = await channelRepo.findById(channel_id);
  if (!channel) throw { status: 404, message: 'Kanal bulunamadı' };
  if (channel.org_id !== user.org_id) throw { status: 403, message: 'Farklı organizasyon kanalına katılamazsınız' };
  if (channel.type !== 'PUBLIC') throw { status: 403, message: 'Bu kanal herkese açık değil' };

  const already = await channelRepo.isMember(channel_id, user.id);
  if (already) throw { status: 409, message: 'Zaten bu kanalın üyesisiniz' };

  await channelRepo.addMember(channel_id, user.id, 'MEMBER');
  return { message: 'Kanala katıldınız' };
};

const inviteToChannel = async (requester, channel_id, target_user_id) => {
  const channel = await channelRepo.findById(channel_id);
  if (!channel) throw { status: 404, message: 'Kanal bulunamadı' };

  const requesterRole = await channelRepo.getMemberRole(channel_id, requester.id);
  if (requesterRole !== 'CHANNEL_ADMIN' && requester.role !== 'ORG_ADMIN') {
    throw { status: 403, message: 'Sadece kanal yöneticisi veya org admin davet edebilir' };
  }

  const already = await channelRepo.isMember(channel_id, target_user_id);
  if (already) throw { status: 409, message: 'Kullanıcı zaten kanalda' };

  await channelRepo.addMember(channel_id, target_user_id, 'MEMBER');
  return { message: 'Kullanıcı kanala eklendi' };
};

const removeMember = async (requester, channel_id, target_user_id) => {
  const channel = await channelRepo.findById(channel_id);
  if (!channel) throw { status: 404, message: 'Kanal bulunamadı' };

  const requesterRole = await channelRepo.getMemberRole(channel_id, requester.id);
  if (requesterRole !== 'CHANNEL_ADMIN' && requester.role !== 'ORG_ADMIN') {
    throw { status: 403, message: 'Sadece kanal yöneticisi veya org admin üye çıkarabilir' };
  }

  await channelRepo.removeMember(channel_id, target_user_id);
  return { message: 'Kullanıcı kanaldan çıkarıldı' };
};

const startDm = async (user, target_user_id) => {
  if (user.id === target_user_id) throw { status: 400, message: 'Kendinizle DM başlatamazsınız' };

  const existing = await channelRepo.findDmBetween(user.id, target_user_id, user.org_id);
  if (existing) return existing;

  const channel = await channelRepo.createChannel({
    org_id: user.org_id,
    name: `dm-${user.id}-${target_user_id}`,
    description: null,
    icon_url: null,
    type: 'DM',
    created_by: user.id,
  });

  await channelRepo.addMember(channel.id, user.id, 'MEMBER');
  await channelRepo.addMember(channel.id, target_user_id, 'MEMBER');

  return channel;
};

const getChannelMembers = async (user, channel_id) => {
  const isMember = await channelRepo.isMember(channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };
  return channelRepo.getMembers(channel_id);
};

const updateNotificationPreference = async (user, channel_id, preference) => {
  const isMember = await channelRepo.isMember(channel_id, user.id);
  if (!isMember) throw { status: 403, message: 'Bu kanalın üyesi değilsiniz' };
  await channelRepo.updateNotificationPreference(channel_id, user.id, preference);
  return { message: 'Bildirim tercihi güncellendi' };
};

const updateMemberRole = async (requester, channel_id, target_user_id, role) => {
  if (!['MEMBER', 'CHANNEL_ADMIN'].includes(role)) {
    throw { status: 400, message: 'Geçersiz rol. MEMBER veya CHANNEL_ADMIN olmalı' };
  }
  const channel = await channelRepo.findById(channel_id);
  if (!channel) throw { status: 404, message: 'Kanal bulunamadı' };

  const requesterRole = await channelRepo.getMemberRole(channel_id, requester.id);
  if (requesterRole !== 'CHANNEL_ADMIN' && requester.role !== 'ORG_ADMIN') {
    throw { status: 403, message: 'Sadece kanal yöneticisi veya org admin rol atayabilir' };
  }

  await channelRepo.updateMemberRole(channel_id, target_user_id, role);
  return { message: `Kullanıcı rolü ${role} olarak güncellendi` };
};

const getPublicChannels = async (user) => {
  return channelRepo.getPublicChannels(user.org_id);
};

module.exports = {
  createChannel, getMyChannels, joinChannel, inviteToChannel,
  removeMember, startDm, getChannelMembers, updateNotificationPreference,
  updateMemberRole, getPublicChannels,
};
