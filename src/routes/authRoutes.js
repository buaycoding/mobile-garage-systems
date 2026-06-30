const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

router.post('/register', async (req, res) => {
  try {
    const createdUser = await createUser(req.body);
    const role = createdUser.role;
    if (role === 'garage_owner') {
      return sendSuccess(res, 'Registration submitted. Please wait for admin approval before you can log in.', { user: createdUser }, 201);
    }

    const { user: safeUser, accessToken, refreshToken } = await loginUser({ email: req.body.email, password: req.body.password });
    return sendSuccess(res, 'Registration successful', { user: safeUser, accessToken, refreshToken }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Registration failed', 400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = await loginUser(req.body);
    return sendSuccess(res, 'Login successful', data, 200);
  } catch (error) {
    return sendError(res, error.message || 'Login failed', 401);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.redirect('/login');
});

router.post('/forgot-password', (req, res) => {
  return sendSuccess(res, 'Forgot password endpoint ready', { step: 'forgot-password' });
});

router.post('/reset-password', (req, res) => {
  return sendSuccess(res, 'Reset password endpoint ready', { step: 'reset-password' });
});

module.exports = router;
