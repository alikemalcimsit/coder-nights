const orgService = require('../services/organizationService');
const { success, error } = require('../utils/response');

const getOrganization = async (req, res) => {
  try {
    const org = await orgService.getOrganization(req.user);
    return success(res, org);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await orgService.getOrgUsers(req.user);
    return success(res, users);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const inviteUser = async (req, res) => {
  try {
    const result = await orgService.inviteUser(req.user, req.body);
    return success(res, result, 'Davet gönderildi', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const acceptInvite = async (req, res) => {
  try {
    const result = await orgService.acceptInvite(req.query.token, req.user.id);
    return success(res, result, 'Organizasyona katıldınız');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getInviteInfo = async (req, res) => {
  try {
    const result = await orgService.getInviteInfo(req.query.token);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getOrganization, getUsers, inviteUser, acceptInvite, getInviteInfo };
