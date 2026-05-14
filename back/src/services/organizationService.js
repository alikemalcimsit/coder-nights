const orgRepo = require('../repositories/organizationRepository');
const authRepo = require('../repositories/authRepository');
const { v4: uuidv4 } = require('uuid');

const getOrganization = async (user) => {
  const org = await orgRepo.findById(user.org_id);
  if (!org) throw { status: 404, message: 'Organizasyon bulunamadı' };
  return org;
};

const getOrgUsers = async (user) => {
  return orgRepo.getUsers(user.org_id);
};

const inviteUser = async (requester, { email, gsm_number }) => {
  if (requester.role !== 'ORG_ADMIN') {
    throw { status: 403, message: 'Sadece Org Admin kullanıcı davet edebilir' };
  }

  const invite_token = uuidv4();
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

  await orgRepo.createInvitation({
    org_id: requester.org_id,
    invited_by: requester.id,
    email: email || null,
    gsm_number: gsm_number || null,
    invite_token,
    expires_at,
  });

  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/register?token=${invite_token}`;
  return { invite_token, invite_link: inviteLink, expires_at };
};

const acceptInvite = async (token, user_id) => {
  const invitation = await orgRepo.findInvitationByToken(token);
  if (!invitation) throw { status: 400, message: 'Geçersiz veya süresi dolmuş davet' };

  await orgRepo.updateUserOrg(user_id, invitation.org_id);
  await orgRepo.acceptInvitation(token);

  return { org_id: invitation.org_id, message: 'Organizasyona katıldınız' };
};

const getInviteInfo = async (token) => {
  if (!token) throw { status: 400, message: 'Token gerekli' };
  const invitation = await orgRepo.findInvitationByToken(token);
  if (!invitation) throw { status: 400, message: 'Geçersiz veya süresi dolmuş davet' };
  const org = await orgRepo.findById(invitation.org_id);
  return {
    org_id: invitation.org_id,
    org_name: org.name,
    org_logo: org.logo_url,
    expires_at: invitation.expires_at,
  };
};

module.exports = { getOrganization, getOrgUsers, inviteUser, acceptInvite, getInviteInfo };
