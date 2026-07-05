import { query } from '../config/database.js';

async function ensureDefaultUser(email = 'demo@wealthflow.local') {
  const existing = await query('SELECT id, name, email FROM users WHERE email = $1 LIMIT 1', [email]);

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const created = await query(
    `INSERT INTO users (name, email, photo)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, photo, created_at, updated_at`,
    ['Demo User', email, null],
  );

  return created.rows[0];
}

async function create(payload) {
  const created = await query(
    `INSERT INTO users (name, email, photo)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, photo, created_at, updated_at`,
    [payload.name || 'Demo User', payload.email, payload.photo || null],
  );

  return created.rows[0];
}

async function findByEmail(email) {
  const result = await query('SELECT id, name, email FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
}

async function getCurrentUser() {
  const result = await query('SELECT id, name, email FROM users ORDER BY id ASC LIMIT 1');
  return result.rows[0] || null;
}

function demoUser(email) {
  return {
    id: 1,
    name: 'Demo User',
    email,
  };
}

export { create, findByEmail, getCurrentUser, demoUser, ensureDefaultUser };
