import mongoose from 'mongoose';
import connectDb from './_db.js';

export default async function handler(req, res) {
  try {
    await connectDb();
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    const dbState = state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnected';
    res.status(200).json({ status: 'ok', db: dbState });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
}