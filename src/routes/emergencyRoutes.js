const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', (req, res) => {
  try {
    return sendSuccess(res, 'Emergency assistance request received', {
      request: {
        location: req.body.location || 'Unknown',
        issue: req.body.issue || 'Unknown',
        phone: req.body.phone || ''
      }
    }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Failed to submit emergency request', 400);
  }
});

module.exports = router;
