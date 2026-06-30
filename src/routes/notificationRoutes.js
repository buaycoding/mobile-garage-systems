const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.get('/', (req, res) => {
  try {
    return sendSuccess(res, 'Notifications fetched successfully', {
      notifications: [
        { id: 1, title: 'Booking confirmed', message: 'Your booking has been confirmed.' },
        { id: 2, title: 'Payment received', message: 'A payment receipt is ready.' }
      ]
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch notifications', 400);
  }
});

module.exports = router;
