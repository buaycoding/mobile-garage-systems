const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const createMemoryPool = () => {
  const state = {
    users: [],
    garages: [
      {
        id: 'garage-1',
        owner_id: 'owner-1',
        name: 'Mobile Garage System',
        description: 'Reliable vehicle service center in Kampala.',
        phone: '+256772000111',
        email: 'info@kampalaautocare.com',
        address: 'Kampala, Uganda',
        opening_hours: 'Mon-Sat 8:00-18:00',
        latitude: 0.3476,
        longitude: 32.5825,
        rating: 4.8,
        is_approved: true,
        created_at: new Date().toISOString()
      }
    ],
    bookings: [],
    roles: [
      { id: 'role-admin', name: 'admin' },
      { id: 'role-garage-owner', name: 'garage_owner' },
      { id: 'role-customer', name: 'customer' }
    ]
  };

  return {
    async query(text, params = []) {
      const sql = text.toUpperCase();

      if (sql.includes('SELECT NOW()')) {
        return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
      }

      if (sql.includes('SELECT U.*, R.NAME AS ROLE_NAME FROM USERS U LEFT JOIN ROLES R ON U.ROLE_ID = R.ID WHERE U.EMAIL =')) {
        const email = params[0];
        const user = state.users.find((item) => item.email === email);
        if (!user) return { rows: [], rowCount: 0 };
        return { rows: [{ ...user, role_name: user.role_name || 'customer' }], rowCount: 1 };
      }

      if (sql.includes('SELECT ID FROM ROLES WHERE NAME =')) {
        const roleName = params[0];
        const role = state.roles.find((item) => item.name === roleName);
        return { rows: role ? [{ id: role.id }] : [], rowCount: role ? 1 : 0 };
      }

      if (sql.includes('INSERT INTO USERS')) {
        const [id, fullName, email, passwordHash, phone, roleId, isVerified, isActive] = params;
        const user = {
          id,
          full_name: fullName,
          email,
          password_hash: passwordHash,
          phone,
          role_id: roleId,
          is_verified: isVerified,
          role_name: 'customer',
          is_active: isActive,
          created_at: new Date().toISOString()
        };
        state.users.push(user);
        return { rows: [{ id, full_name: fullName, email, phone, role_id: roleId }], rowCount: 1 };
      }

      if (sql.includes('SELECT * FROM GARAGES ORDER BY CREATED_AT DESC LIMIT 20')) {
        return { rows: state.garages, rowCount: state.garages.length };
      }

      if (sql.includes('SELECT * FROM GARAGES WHERE ID =')) {
        const garage = state.garages.find((item) => item.id === params[0]);
        return { rows: garage ? [garage] : [], rowCount: garage ? 1 : 0 };
      }

      if (sql.includes('SELECT NAME FROM GARAGES WHERE ID =')) {
        const garage = state.garages.find((item) => item.id === params[0]);
        return { rows: garage ? [{ name: garage.name }] : [], rowCount: garage ? 1 : 0 };
      }

      if (sql.includes('SELECT NAME FROM SERVICES WHERE ID =')) {
        const serviceId = params[0];
        const serviceName = serviceId === 'service-1' ? 'Oil Change' : 'General Service';
        return { rows: [{ name: serviceName }], rowCount: 1 };
      }

      if (sql.includes('INSERT INTO BOOKINGS')) {
        const [customerId, garageId, serviceId, vehicleId, bookingDate, bookingTime, status, totalAmount, paymentStatus] = params;
        const booking = {
          id: randomUUID(),
          customer_id: customerId,
          garage_id: garageId,
          service_id: serviceId,
          vehicle_id: vehicleId,
          booking_date: bookingDate,
          booking_time: bookingTime,
          status,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          created_at: new Date().toISOString()
        };
        state.bookings.push(booking);
        return { rows: [booking], rowCount: 1 };
      }

      if (sql.includes('SELECT * FROM BOOKINGS WHERE CUSTOMER_ID =')) {
        const customerId = params[0];
        const bookings = state.bookings.filter((item) => item.customer_id === customerId);
        return { rows: bookings, rowCount: bookings.length };
      }

      if (sql.includes('SELECT * FROM BOOKINGS WHERE GARAGE_ID =')) {
        const garageId = params[0];
        const bookings = state.bookings.filter((item) => item.garage_id === garageId);
        return { rows: bookings, rowCount: bookings.length };
      }

      if (sql.includes('UPDATE BOOKINGS SET STATUS =')) {
        const [status, bookingId] = params;
        const booking = state.bookings.find((item) => item.id === bookingId);
        if (!booking) {
          return { rows: [], rowCount: 0 };
        }
        booking.status = status;
        return { rows: [booking], rowCount: 1 };
      }

      if (sql.includes('SELECT COUNT(*)::INT AS TOTAL FROM USERS')) {
        return { rows: [{ total: state.users.length }], rowCount: 1 };
      }

      if (sql.includes('SELECT COUNT(*)::INT AS TOTAL FROM GARAGES')) {
        return { rows: [{ total: state.garages.length }], rowCount: 1 };
      }

      if (sql.includes('SELECT COUNT(*)::INT AS TOTAL FROM BOOKINGS')) {
        return { rows: [{ total: state.bookings.length }], rowCount: 1 };
      }

      if (sql.includes('SELECT COALESCE(SUM(TOTAL_AMOUNT),0)::NUMERIC AS TOTAL FROM BOOKINGS')) {
        const total = state.bookings.reduce((acc, booking) => acc + Number(booking.total_amount || 0), 0);
        return { rows: [{ total }], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    },
    async end() {
      return true;
    }
  };
};

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

// Helper to detect placeholder values that indicate no configured DB
const looksLikePlaceholder = (val) => !val || String(val).trim() === '' || /\bHOST\b/i.test(val) || /garage\s?system/i.test(val);

let pool;
let usingMemoryPool = false;

if (!looksLikePlaceholder(connectionString)) {
  pool = new Pool({ connectionString });
} else if (!looksLikePlaceholder(process.env.DB_HOST)) {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'garage_booking',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
} else {
  // No valid remote DB configured — use in-memory fallback to avoid ENOTFOUND errors in logs
  pool = createMemoryPool();
  usingMemoryPool = true;
  console.warn('⚠️ No valid DATABASE_URL or DB_HOST provided; using in-memory fallback.');
}

if (!usingMemoryPool) {
  pool.connect()
    .then((client) => {
      console.log('✅ PostgreSQL connected');
      client.release();
    })
    .catch((err) => {
      console.warn('⚠️ PostgreSQL connection warning:', err.message);
    });
}

module.exports = { pool };
