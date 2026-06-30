const express = require('express');
const router = express.Router();
const { listBookingsForGarage, updateBookingStatus, getGarageName, getServiceName } = require('../repositories/bookingRepository');
const { sendSuccess, sendError } = require('../utils/response');

const allowedStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

const normalizeStatus = (status) => {
  if (!status) return 'pending';
  const normalized = String(status).trim().toLowerCase();
  const statusMap = {
    pending: 'pending',
    accepted: 'accepted',
    in_progress: 'in_progress',
    inprogress: 'in_progress',
    started: 'in_progress',
    completed: 'completed',
    rejected: 'rejected',
    cancelled: 'cancelled',
    canceled: 'cancelled'
  };
  return statusMap[normalized] || normalized;
};

router.get('/', async (req, res) => {
  try {
    const bookings = await listBookingsForGarage('garage-1');
    const normalized = await Promise.all(bookings.map(async (booking) => ({
      id: booking.id,
      customer: booking.customer_id || 'Guest',
      garage: await getGarageName(booking.garage_id),
      service: await getServiceName(booking.service_id),
      status: normalizeStatus(booking.status || 'pending'),
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      totalAmount: booking.total_amount
    })));
    return sendSuccess(res, 'Booking management data fetched successfully', { bookings: normalized });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch booking management data', 400);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const status = normalizeStatus(req.body.status);
    if (!allowedStatuses.includes(status)) {
      return sendError(res, 'Invalid booking status', 400);
    }

    const booking = await updateBookingStatus(req.params.id, status);
    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }
    return sendSuccess(res, 'Booking status updated successfully', { booking });
  } catch (error) {
    return sendError(res, error.message || 'Failed to update booking status', 400);
  }
});

module.exports = router;
