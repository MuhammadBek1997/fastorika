export default async function handler(req, res) {
  try {
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    res.status(200).json({
      status: 'ok',
      env: {
        hasMongoUri,
        hasJwtSecret,
      },
      runtime: {
        node: process.version,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
}