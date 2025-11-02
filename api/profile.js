import connectDb from './_db.js';
import { requireAuth } from './_jwt.js';
import User from '../server/models/User.js';

export default async function handler(req, res) {
  try {
    await connectDb();
    const payload = requireAuth(req);
    const userId = payload.uid;

    if (req.method === 'GET') {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json(user);
      return;
    }

  if (req.method === 'PUT') {
      const { firstName, lastName, phone, country, birthDate } = req.body || {};

      // Build partial update object: only include provided, non-empty fields
      const updates = {};
      const apply = (key, val) => {
        if (val === undefined || val === null) return;
        if (typeof val === 'string' && val.trim() === '') return;
        updates[key] = typeof val === 'string' ? val.trim() : val;
      };
      apply('firstName', firstName);
      apply('lastName', lastName);
      apply('phone', phone);
      apply('country', country);
      apply('birthDate', birthDate);

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'Hech qanday o\'zgarish topilmadi' });
        return;
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).select('-passwordHash');
      res.status(200).json(updated);
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ message: err.message || 'Server error' });
  }
}