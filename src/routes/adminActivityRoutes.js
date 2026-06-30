const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.get('/', (req, res) => {
  try {
    return sendSuccess(res, 'Admin activity fetched successfully', {
      activities: [
        { id: 1, action: 'Approved garage registration', actor: 'Admin' },
        { id: 2, action: 'Flagged review for moderation', actor: 'Admin' }
      ]
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch admin activity', 400);
  }
});

module.exports = router;
