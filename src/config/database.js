const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'garage system',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'buayca10',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
);

pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL connected');
    client.release();
  })
  .catch((err) => {
    console.warn('⚠️ PostgreSQL connection warning:', err.message);
  });

module.exports = { pool };
