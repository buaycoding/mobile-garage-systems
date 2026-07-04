const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../src/app');
const request = require('supertest');
const { createBooking } = require('../src/repositories/bookingRepository');

const uniqueEmail = `tester${Date.now()}@example.com`;

test('GET / returns 200', async () => {
  const response = await request(app).get('/');
  assert.equal(response.status, 200);
});

test('GET /booking renders a booking form', async () => {
  const response = await request(app).get('/booking?garage=Mobile%20Garage%20System');
  assert.equal(response.status, 200);
  assert.match(response.text, /Book a Service/i);
  assert.match(response.text, /Create Booking/i);
});

test('GET /api/garages returns success payload', async () => {
  const response = await request(app).get('/api/garages');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test('POST /api/payments initiates a mobile money payment', async () => {
  const response = await request(app).post('/api/payments').send({
    amount: 120000,
    method: 'MTN Mobile Money',
    phoneNumber: '0772000111'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.payment.method, 'MTN Mobile Money');
  assert.equal(response.body.data.payment.status, 'pending');
});

test('GET /garages?nearby=true renders the nearby map experience', async () => {
  const response = await request(app).get('/garages?nearby=true');
  assert.equal(response.status, 200);
  assert.match(response.text, /Nearby Garages/i);
  assert.match(response.text, /google\.com\/maps/i);
});

test('POST /api/auth/register creates a user and returns tokens', async () => {
  const response = await request(app).post('/api/auth/register').send({
    fullName: 'Test User',
    email: uniqueEmail,
    password: 'StrongPass123',
    phone: '+256700000123'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);
});

test('POST /api/auth/login authenticates a registered user', async () => {
  const response = await request(app).post('/api/auth/login').send({
    email: uniqueEmail,
    password: 'StrongPass123'
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
});

test('GET /api/auth/logout redirects to login', async () => {
  const response = await request(app).get('/api/auth/logout');

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login');
});

test('POST /api/auth/register stores a customer role and returns it', async () => {
  const customerEmail = `customer${Date.now()}@example.com`;
  const response = await request(app).post('/api/auth/register').send({
    fullName: 'Customer User',
    email: customerEmail,
    password: 'StrongPass123',
    phone: '+256700000124',
    role: 'customer'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.role, 'customer');
});

test('GET /dashboard/customer returns 200', async () => {
  const response = await request(app).get('/dashboard/customer');
  assert.equal(response.status, 200);
});

test('GET /dashboard/admin shows garage owners waiting for approval', async () => {
  const ownerEmail = `owner${Date.now()}@example.com`;
  const registerResponse = await request(app).post('/api/auth/register').send({
    fullName: 'Garage Owner',
    email: ownerEmail,
    password: 'StrongPass123',
    phone: '+256700000125',
    role: 'garage_owner'
  });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);

  const response = await request(app).get('/dashboard/admin');
  assert.equal(response.status, 200);
  assert.match(response.text, new RegExp(ownerEmail));
});

test('PATCH /api/booking-management/:id updates booking status', async () => {
  const booking = await createBooking({
    customerId: 'customer-1',
    garageId: 'garage-1',
    serviceId: 'service-1',
    vehicleId: 'vehicle-1',
    bookingDate: '2026-06-26',
    bookingTime: '10:00',
    totalAmount: 150000
  });

  const response = await request(app).patch(`/api/booking-management/${booking.id}`).send({ status: 'accepted' });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.booking.status, 'accepted');
});

test('PATCH /api/booking-management/:id rejects invalid booking statuses', async () => {
  const booking = await createBooking({
    customerId: 'customer-1',
    garageId: 'garage-1',
    serviceId: 'service-1',
    vehicleId: 'vehicle-1',
    bookingDate: '2026-06-26',
    bookingTime: '11:00',
    totalAmount: 200000
  });

  const response = await request(app).patch(`/api/booking-management/${booking.id}`).send({ status: 'mystery' });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
