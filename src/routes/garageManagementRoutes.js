const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', (req, res) => {
  try {
    return sendSuccess(res, 'Garage saved successfully', {
      garage: {
        name: req.body.name || 'Mobile Garage System',
        description: req.body.description || 'Trusted garage service',
        phone: req.body.phone || '+256772000111',
        address: req.body.address || 'Kampala Road'
      }
    }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Failed to save garage', 400);
  }
});

module.exports = router;
