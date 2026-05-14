const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createOrganization = async ({ name, logo_url, domain, created_by }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO organizations (id, name, logo_url, domain, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, name, logo_url || null, domain || null, created_by]
  );
  return findById(id);
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM organizations WHERE id = ?', [id]);
  return rows[0] || null;
};

const findByDomain = async (domain) => {
  const [rows] = await db.query('SELECT * FROM organizations WHERE domain = ?', [domain]);
  return rows[0] || null;
};

const getUsers = async (org_id) => {
  const [rows] = await db.query(
    'SELECT id, full_name, gsm_number, email, profile_photo_url, status_message, presence_status, role, last_seen, created_at FROM users WHERE org_id = ?',
    [org_id]
  );
  return rows;
};

const createInvitation = async ({ org_id, invited_by, email, gsm_number, invite_token, expires_at }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO organization_invitations (id, org_id, invited_by, email, gsm_number, invite_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, org_id, invited_by, email || null, gsm_number || null, invite_token, expires_at]
  );
  return id;
};

const findInvitationByToken = async (token) => {
  const [rows] = await db.query(
    'SELECT * FROM organization_invitations WHERE invite_token = ? AND status = "PENDING" AND expires_at > NOW()',
    [token]
  );
  return rows[0] || null;
};

const acceptInvitation = async (token) => {
  await db.query('UPDATE organization_invitations SET status = "ACCEPTED" WHERE invite_token = ?', [token]);
};

const updateUserOrg = async (user_id, org_id) => {
  await db.query('UPDATE users SET org_id = ? WHERE id = ?', [org_id, user_id]);
};

module.exports = {
  createOrganization, findById, findByDomain,
  getUsers, createInvitation, findInvitationByToken, acceptInvitation, updateUserOrg,
};
