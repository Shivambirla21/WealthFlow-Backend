import { createUser, findUserByEmail, verifyPassword, generateToken } from '../models/auth.model.js';

async function register(req, res, next) {
  try {
    const { name, email, password, photo } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const user = await createUser({ name, email, password, photo });
    const token = generateToken(user);

    res.status(201).json({ success: true, data: { token, user } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const passwordValid = await verifyPassword(user, password);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password_hash, ...userData } = user;
    res.json({ success: true, data: { token, user: userData } });
  } catch (error) {
    next(error);
  }
}

export { register, login };
