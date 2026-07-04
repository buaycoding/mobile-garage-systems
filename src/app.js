require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const { pool } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const garageRoutes = require('./routes/garageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminActivityRoutes = require('./routes/adminActivityRoutes');
const garageManagementRoutes = require('./routes/garageManagementRoutes');
const bookingManagementRoutes = require('./routes/bookingManagementRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

let databaseReady = false;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net']
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get('/', (req, res) => {
  res.render('index', { title: 'Garage Booking Uganda' });
});

app.get('/booking', (req, res) => {
  res.render('booking', {
    title: 'Book a Service',
    garage: req.query.garage || '',
    garageId: req.query.garageId || ''
  });
});

app.get('/garages', (req, res) => {
  const nearby = req.query.nearby === 'true';
  const query = req.query.query || 'Kampala, Uganda';
  res.render('garages', { title: 'Find Garages', nearby, query });
});

app.get('/garage-detail', (req, res) => {
  res.render('garage-detail', { title: 'Garage Details' });
});

app.get('/emergency', (req, res) => {
  res.render('emergency', { title: 'Roadside Assistance' });
});

app.get('/payment', (req, res) => {
  res.render('payment', {
    title: 'Complete Payment',
    defaultAmount: Number(req.query.amount || 120000),
    defaultMethod: req.query.method || 'MTN Mobile Money',
    defaultPhone: req.query.phone || ''
  });
});

app.get('/notifications', (req, res) => {
  res.render('notifications', { title: 'Notifications' });
});

app.get('/reports', (req, res) => {
  res.render('reports', { title: 'Reports' });
});

app.get('/admin-activity', (req, res) => {
  res.render('admin-activity', { title: 'Admin Activity' });
});

app.get('/garage-management', (req, res) => {
  res.render('garage-management', { title: 'Garage Management' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Create Account' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/create-garage', (req, res) => {
  res.render('create-garage', { title: 'Create Garage' });
});

app.get('/booking-management', (req, res) => {
  res.render('booking-management', { title: 'Booking Management' });
});

app.get('/dashboard/owner', (req, res) => {
  res.render('dashboard/owner', { title: 'Owner Dashboard' });
});

app.get('/dashboard/admin', async (req, res) => {
  try {
    const pendingApprovalsResult = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'garage_owner' AND u.is_active = false
      ORDER BY u.created_at DESC
    `);

    res.render('dashboard/admin', {
      title: 'Admin Dashboard',
      pendingApprovals: pendingApprovalsResult.rows || []
    });
  } catch (error) {
    res.render('dashboard/admin', {
      title: 'Admin Dashboard',
      pendingApprovals: []
    });
  }
});

app.get('/dashboard/customer', (req, res) => {
  res.render('dashboard/customer', {
    title: 'Customer Dashboard',
    upcomingServices: 0,
    completedBookings: 0,
    savedGarages: 0,
    recentActivity: []
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/garages', garageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin-activity', adminActivityRoutes);
app.use('/api/garage-management', garageManagementRoutes);
app.use('/api/booking-management', bookingManagementRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('join-room', (room) => socket.join(room));
  socket.on('disconnect', () => {});
});

app.set('io', io);

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    databaseReady = true;
    console.log('Database connected');
  } catch (error) {
    console.warn('Database not available, continuing in development mode:', error.message);
  }

  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      const { execSync } = require('child_process');
      console.log('Initializing database schema...');
      execSync('node scripts/init-db.js', { stdio: 'inherit' });
    } catch (initError) {
      console.warn('Database schema initialization warning:', initError.message);
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    const tryListen = (port) => {
      httpServer.removeAllListeners('error');
      httpServer.once('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          const nextPort = port + 1;
          console.warn(`Port ${port} is busy. Trying ${nextPort}...`);
          tryListen(nextPort);
        } else {
          console.error('Failed to start server:', error);
          process.exit(1);
        }
      });

      httpServer.listen(port, HOST, () => {
        console.log(`Server running on http://${HOST}:${port}`);
      });
    };

    tryListen(PORT);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, httpServer, io, startServer };
