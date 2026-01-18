import { OAuth2Client } from 'google-auth-library'
import config from '../config/index.js'

const googleClient = new OAuth2Client(config.google.clientId)

/**
 * Verify Google ID Token and extract user information
 * @param {string} idToken - Google ID token from frontend
 * @returns {Promise<Object>} User data from Google
 */
export async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    })

    const payload = ticket.getPayload()

    return {
      success: true,
      user: {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        locale: payload.locale,
      },
      rawPayload: payload,
    }
  } catch (error) {
    console.error('Google token verification failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to verify Google token',
    }
  }
}

/**
 * Exchange authorization code for tokens (alternative flow)
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - Redirect URI used in the authorization request
 * @returns {Promise<Object>} Tokens and user data
 */
export async function exchangeGoogleCode(code, redirectUri) {
  try {
    const client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      redirectUri
    )

    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Verify the ID token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    })

    const payload = ticket.getPayload()

    return {
      success: true,
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expiry_date,
      },
      user: {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        locale: payload.locale,
      },
    }
  } catch (error) {
    console.error('Google code exchange failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to exchange Google authorization code',
    }
  }
}

export default {
  verifyGoogleToken,
  exchangeGoogleCode,
}
