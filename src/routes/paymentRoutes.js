const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', (req, res) => {
  try {
    return sendSuccess(res, 'Payment initiated successfully', {
      payment: {
        amount: req.body.amount || 120000,
        method: req.body.method || 'MTN Mobile Money',
        status: 'pending'
      },
      invoice: {
        invoiceId: 'INV-1001',
        receipt: 'Receipt generated successfully'
      }
    }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Failed to initiate payment', 400);
  }
});

module.exports = router;
