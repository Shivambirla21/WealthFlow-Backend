import pg from 'pg';
import { env } from './envConfig.js';

const { Pool } = pg;

// Normalize SSL mode in the connection string to avoid deprecation warnings
// ('prefer', 'require', 'verify-ca' are aliases for 'verify-full' currently).
let pool = null;
if (env.databaseUrl) {
  let connectionString = env.databaseUrl;

  // replace sslmode values that will change semantics in future pg versions
  connectionString = connectionString.replace(/sslmode=(prefer|require|verify-ca)/i, 'sslmode=verify-full');

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

async function connectDatabase() {
  if (!env.databaseUrl) {
    return {
      connected: false,
      message: 'DATABASE_URL is not configured',
    };
  }

  const client = await pool.connect();

  try {
    const result = await client.query('SELECT current_database() AS database, current_user AS user');

    return {
      connected: true,
      database: result.rows[0].database,
      user: result.rows[0].user,
    };
  } finally {
    client.release();
  }
}

function query(text, params) {
  if (!pool) {
    throw new Error('Database pool is not configured. Set DATABASE_URL in .env.');
  }

  return pool.query(text, params);
}

export { connectDatabase, query, pool };
