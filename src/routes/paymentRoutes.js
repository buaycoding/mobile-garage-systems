const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', (req, res) => {
  try {
    const amount = Number(req.body.amount || 120000);
    const method = req.body.method || 'MTN Mobile Money';
    const phoneNumber = req.body.phoneNumber || req.body.phone || '';

    if (!phoneNumber) {
      return sendError(res, 'Phone number is required for Mobile Money payment', 400);
    }

    const paymentReference = `MM-${Date.now().toString().slice(-6)}`;

    return sendSuccess(res, 'Payment initiated successfully', {
      payment: {
        amount,
        method,
        phoneNumber,
        status: 'pending',
        reference: paymentReference
      },
      invoice: {
        invoiceId: `INV-${paymentReference}`,
        receipt: 'Receipt generated successfully'
      }
    }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Failed to initiate payment', 400);
  }
});

module.exports = router;
