const { pool } = require('../config/database');

const getGarageName = async (garageId) => {
  if (!garageId) return 'Garage';
  const result = await pool.query('SELECT name FROM garages WHERE id = $1', [garageId]);
  return result.rows[0]?.name || 'Garage';
};

const getServiceName = async (serviceId) => {
  if (!serviceId) return 'General Service';
  const result = await pool.query('SELECT name FROM services WHERE id = $1', [serviceId]);
  return result.rows[0]?.name || 'General Service';
};

const createBooking = async ({ customerId, garageId, serviceId, vehicleId, bookingDate, bookingTime, totalAmount }) => {
  const result = await pool.query(
    `INSERT INTO bookings (customer_id, garage_id, service_id, vehicle_id, booking_date, booking_time, status, total_amount, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, 'pending')
     RETURNING *`,
    [customerId, garageId, serviceId, vehicleId, bookingDate, bookingTime, totalAmount]
  );
  return result.rows[0];
};

const listBookingsForUser = async (customerId) => {
  const result = await pool.query('SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
  return result.rows;
};

const listBookingsForGarage = async (garageId) => {
  const result = await pool.query('SELECT * FROM bookings WHERE garage_id = $1 ORDER BY created_at DESC', [garageId]);
  return result.rows;
};

const updateBookingStatus = async (bookingId, status) => {
  const result = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, bookingId]
  );
  return result.rows[0];
};

module.exports = {
  createBooking,
  listBookingsForUser,
  listBookingsForGarage,
  updateBookingStatus,
  getGarageName,
  getServiceName
};
