import mongoose from 'mongoose';

let cached = global._mongooseConn;

export default async function connectDb() {
  if (cached) {
    return cached;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  cached = await mongoose.connect(uri);
  global._mongooseConn = cached;
  return cached;
}