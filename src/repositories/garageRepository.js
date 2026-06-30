const { pool } = require('../config/database');

const listGarages = async () => {
  const result = await pool.query('SELECT * FROM garages ORDER BY created_at DESC LIMIT 20');
  return result.rows;
};

const getGarageById = async (id) => {
  const result = await pool.query('SELECT * FROM garages WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports = { listGarages, getGarageById };
