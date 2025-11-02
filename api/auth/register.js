import connectDb from '../_db.js';
import User from '../../server/models/User.js';
import bcrypt from 'bcryptjs';
import { handleCors, setCors } from '../_cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    setCors(res);
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  try {
    await connectDb();
    const { email, password } = req.body || {};
    if (!email || !password) {
      setCors(res);
      res.status(400).json({ message: 'Email and password required' });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      setCors(res);
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash });
    setCors(res);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    const msg = err && err.message ? err.message : 'Server error';
    setCors(res);
    res.status(500).json({ message: msg });
  }
}

