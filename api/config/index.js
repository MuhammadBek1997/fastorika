// OAuth Configuration
export const config = {
  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Apple OAuth
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },

  // Main Backend API
  mainBackend: {
    baseUrl: process.env.MAIN_BACKEND_URL || 'https://api.fastorika.com',
    apiKey: process.env.MAIN_BACKEND_API_KEY,
  },

  // Frontend URLs
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'https://fastorika.vercel.app',
    successRedirect: '/auth/success',
    errorRedirect: '/auth/error',
  },

  // JWT Secret for session tokens
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
}

export default config
