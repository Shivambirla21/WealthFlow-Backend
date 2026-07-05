import pg from 'pg';
import { env } from './envConfig.js';

const { Pool } = pg;

const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : null;

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
