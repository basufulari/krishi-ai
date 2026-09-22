import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

function dbUnavailableMessage() {
  return 'Database not ready. Start MongoDB on your PC (run mongod or start MongoDB service), then restart the backend.';
}

/** Allow connecting (2); reject only disconnected / disconnecting so first register after server start still works. */
function isDbDisconnected() {
  const s = mongoose.connection.readyState;
  return s === 0 || s === 3;
}

function isMongoUnreachable(err) {
  const n = err?.name || '';
  return (
    n === 'MongoServerSelectionError' ||
    n === 'MongoNetworkError' ||
    n === 'MongooseError' ||
    String(err?.message || '').includes('buffering timed out')
  );
}
const JWT_SECRET = process.env.JWT_SECRET || 'krishi_secret_123';
// Lower cost = faster register on slow PCs. Set BCRYPT_ROUNDS=10 in .env for stronger hashing.
const _rounds = Number(process.env.BCRYPT_ROUNDS);
const BCRYPT_ROUNDS = Number.isFinite(_rounds) && _rounds >= 4 && _rounds <= 12 ? _rounds : 8;

router.post('/register', async (req, res) => {
  try {
    const { phone, name, pin, role } = req.body;
    if (!phone || !name || !pin) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    if (isDbDisconnected()) {
      return res.status(503).json({ success: false, error: dbUnavailableMessage() });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Phone number already registered.' });
    }

    const hashedPin = await bcrypt.hash(pin, BCRYPT_ROUNDS);
    const newUser = new User({ phone, name, pin: hashedPin, role: role === 'admin' ? 'admin' : 'farmer' });
    await newUser.save();

    const token = jwt.encode({ userId: newUser._id, phone, name, role: newUser.role }, JWT_SECRET);
    return res.json({ success: true, token, user: { phone, name, role: newUser.role } });
  } catch (err) {
    console.error('REGISTER_ERR', err);
    if (isMongoUnreachable(err)) {
      return res.status(503).json({
        success: false,
        error:
          'Cannot reach MongoDB. Start mongod (or MongoDB Windows service), check MONGODB_URI in backend/.env, then restart the backend.',
      });
    }
    return res.status(500).json({ success: false, error: 'Failed to save user.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ success: false, error: 'Phone and PIN required.' });
    }

    if (isDbDisconnected()) {
      return res.status(503).json({ success: false, error: dbUnavailableMessage() });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found. Please register.' });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect PIN.' });
    }

    const token = jwt.encode({ userId: user._id, phone: user.phone, name: user.name, role: user.role }, JWT_SECRET);
    return res.json({ success: true, token, user: { phone: user.phone, name: user.name, role: user.role } });
  } catch (err) {
    console.error('LOGIN_ERR', err);
    if (isMongoUnreachable(err)) {
      return res.status(503).json({
        success: false,
        error:
          'Cannot reach MongoDB. Start mongod, check MONGODB_URI, then restart the backend.',
      });
    }
    return res.status(500).json({ success: false, error: 'Login check failed.' });
  }
});

export default router;
