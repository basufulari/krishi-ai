import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'krishi_secret_123';

// Middleware to verify Admin JWT Token
export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. Admin token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token, JWT_SECRET);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Database Administrator rights required.' });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin token.' });
  }
}

// Admin Login Route
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ success: false, error: 'Admin phone and PIN are required.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect PIN.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Account is not a Database Administrator.' });
    }

    const token = jwt.encode(
      { userId: user._id, phone: user.phone, name: user.name, role: user.role },
      JWT_SECRET
    );

    return res.json({
      success: true,
      token,
      admin: { phone: user.phone, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('ADMIN_LOGIN_ERR', err);
    return res.status(500).json({ success: false, error: 'Admin login failed.' });
  }
});

// Admin Get All Users Route
router.get('/users', requireAdmin, async (req, res) => {
  try {
    // Fetch all user records from MongoDB
    const users = await User.find({}, 'phone name role pin createdAt updatedAt').sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        phone: u.phone,
        name: u.name,
        role: u.role,
        hashedPin: u.pin,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }))
    });
  } catch (err) {
    console.error('ADMIN_GET_USERS_ERR', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user data from database.' });
  }
});

export default router;
