import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { env } from '../config/envConfig.js';

const SALT_ROUNDS = 10;

async function findUserByEmail(email) {
  const result = await query('SELECT id, name, email, photo, password_hash FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
}

async function createUser({ name, email, password, photo }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO users (name, email, photo, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, photo, created_at, updated_at`,
    [name || 'WealthFlow User', email, photo || null, passwordHash],
  );

  return result.rows[0];
}

async function createSocialUser({ name, email, photo }) {
  const randomPassword = crypto.randomBytes(16).toString('hex');
  return createUser({ name, email, password: randomPassword, photo });
}

function generateToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

async function verifyPassword(user, candidatePassword) {
  if (!user || !user.password_hash) return false;
  return bcrypt.compare(candidatePassword, user.password_hash);
}

export { findUserByEmail, createUser, createSocialUser, generateToken, verifyPassword };
