const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.get('/', (req, res) => {
  try {
    return sendSuccess(res, 'Reports fetched successfully', {
      reports: [
        { id: 1, title: 'Daily Revenue Report', period: 'Today' },
        { id: 2, title: 'Weekly Booking Overview', period: 'This Week' },
        { id: 3, title: 'Garage Performance Summary', period: 'This Month' }
      ]
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch reports', 400);
  }
});

module.exports = router;
