const express = require('express');
const router = express.Router();
const { listGarages, getGarageById } = require('../repositories/garageRepository');
const { sendSuccess, sendError } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const garages = await listGarages();
    return sendSuccess(res, 'Garages fetched successfully', { garages });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch garages', 500);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const garage = await getGarageById(req.params.id);
    if (!garage) return sendError(res, 'Garage not found', 404);
    return sendSuccess(res, 'Garage fetched successfully', { garage });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch garage', 500);
  }
});

module.exports = router;
