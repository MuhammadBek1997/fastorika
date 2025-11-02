import connectDb from '../_db.js';
import User from '../../server/models/User.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    await connectDb();
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash });
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

