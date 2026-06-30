const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const signToken = (payload, secret, expiresIn) => jwt.sign(payload, secret || 'dev-secret', { expiresIn });

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT u.*, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = $1', [email]);
  return result.rows[0] || null;
};

const createUser = async ({ fullName, email, password, phone, role = 'customer' }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();
  const normalizedRole = role === 'garage_owner' ? 'garage_owner' : 'customer';
  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [normalizedRole]);
  const roleId = roleResult.rows[0]?.id;

  const shouldRequireApproval = normalizedRole === 'garage_owner';
  const isActive = !shouldRequireApproval;

  const result = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, phone, role_id, is_verified, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, full_name, email, phone, role_id`,
    [userId, fullName, email, passwordHash, phone, roleId, true, isActive]
  );

  const user = result.rows[0];
  return {
    ...user,
    role: normalizedRole
  };
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (user.role_name === 'garage_owner' && user.is_active === false) {
    throw new Error('Your account is pending admin approval');
  }

  const accessToken = signToken({ sub: user.id, role: user.role_name || 'customer' }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '15m');
  const refreshToken = signToken({ sub: user.id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN || '7d');

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role_name || 'customer'
    },
    accessToken,
    refreshToken
  };
};

module.exports = { createUser, loginUser, findUserByEmail, hashPassword, comparePassword };
