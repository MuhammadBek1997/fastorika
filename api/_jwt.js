import jwt from 'jsonwebtoken';

export function requireAuth(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    const err = new Error('No token provided');
    err.statusCode = 401;
    throw err;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return payload; // { uid, email }
  } catch (e) {
    const err = new Error('Invalid token');
    err.statusCode = 401;
    throw err;
  }
}