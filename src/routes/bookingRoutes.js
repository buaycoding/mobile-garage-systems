const express = require('express');
const router = express.Router();
const { createBooking, listBookingsForUser, getGarageName, getServiceName } = require('../repositories/bookingRepository');
const { authenticate } = require('../middlewares/authMiddleware');
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', authenticate, async (req, res) => {
  try {
    const booking = await createBooking({
      customerId: req.user.sub,
      garageId: req.body.garageId,
      serviceId: req.body.serviceId,
      vehicleId: req.body.vehicleId,
      bookingDate: req.body.bookingDate,
      bookingTime: req.body.bookingTime,
      totalAmount: req.body.totalAmount || 0
    });
    return sendSuccess(res, 'Booking created successfully', { booking }, 201);
  } catch (error) {
    return sendError(res, error.message || 'Failed to create booking', 400);
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const bookings = await listBookingsForUser(req.user.sub);
    const normalized = await Promise.all(bookings.map(async (booking) => ({
      id: booking.id,
      garage: await getGarageName(booking.garage_id),
      service: await getServiceName(booking.service_id),
      status: booking.status || 'pending',
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      totalAmount: booking.total_amount
    })));
    return sendSuccess(res, 'Booking history fetched successfully', { bookings: normalized });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch bookings', 500);
  }
});

module.exports = router;
