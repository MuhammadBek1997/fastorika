import connectDb from '../_db.js';
import User from '../../server/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ uid: user._id.toString(), email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}