const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// CORS: Frontend dev server
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5174';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  });

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash });
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { uid: user._id, email: user.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// JWT auth middleware
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Profile routes
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, country, birthDate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.uid,
      { firstName, lastName, phone, country, birthDate },
      { new: true }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});