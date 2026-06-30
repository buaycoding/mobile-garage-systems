const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { sendSuccess, sendError } = require('../utils/response');

router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users, garages, bookings, revenue, pendingApprovals] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM users'),
      pool.query('SELECT COUNT(*)::int AS total FROM garages'),
      pool.query('SELECT COUNT(*)::int AS total FROM bookings'),
      pool.query('SELECT COALESCE(SUM(total_amount),0)::numeric AS total FROM bookings'),
      pool.query(`
        SELECT u.id, u.full_name, u.email, u.phone, u.created_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'garage_owner' AND u.is_active = false
        ORDER BY u.created_at DESC
      `)
    ]);

    return sendSuccess(res, 'Admin dashboard metrics loaded', {
      metrics: {
        totalUsers: users.rows[0].total,
        totalGarages: garages.rows[0].total,
        totalBookings: bookings.rows[0].total,
        totalRevenue: Number(revenue.rows[0].total || 0)
      },
      pendingApprovals: pendingApprovals.rows
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to load admin dashboard', 500);
  }
});

module.exports = router;
