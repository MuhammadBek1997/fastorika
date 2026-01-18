import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import config from '../config/index.js'

// Apple's public keys endpoint
const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'
const APPLE_ISSUER = 'https://appleid.apple.com'

// Cache for Apple's public keys
let appleKeysCache = null
let keysCacheTime = 0
const KEYS_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch Apple's public keys for JWT verification
 * @returns {Promise<Array>} Apple's public keys
 */
async function getApplePublicKeys() {
  const now = Date.now()

  // Return cached keys if still valid
  if (appleKeysCache && (now - keysCacheTime) < KEYS_CACHE_DURATION) {
    return appleKeysCache
  }

  try {
    const response = await fetch(APPLE_KEYS_URL)
    const data = await response.json()

    appleKeysCache = data.keys
    keysCacheTime = now

    return data.keys
  } catch (error) {
    console.error('Failed to fetch Apple public keys:', error)
    throw new Error('Unable to fetch Apple public keys')
  }
}

/**
 * Convert JWK to PEM format for verification
 * @param {Object} jwk - JSON Web Key
 * @returns {string} PEM formatted key
 */
function jwkToPem(jwk) {
  const keyObject = crypto.createPublicKey({ key: jwk, format: 'jwk' })
  return keyObject.export({ type: 'spki', format: 'pem' })
}

/**
 * Verify Apple identity token
 * @param {string} identityToken - Apple identity token from frontend
 * @returns {Promise<Object>} Decoded token payload
 */
export async function verifyAppleToken(identityToken) {
  try {
    // Decode the token header to get the key ID
    const tokenParts = identityToken.split('.')
    const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())

    // Get Apple's public keys
    const keys = await getApplePublicKeys()

    // Find the matching key
    const matchingKey = keys.find(key => key.kid === header.kid)
    if (!matchingKey) {
      return {
        success: false,
        error: 'No matching key found for token verification',
      }
    }

    // Convert JWK to PEM
    const publicKey = jwkToPem(matchingKey)

    // Verify and decode the token
    const decoded = jwt.verify(identityToken, publicKey, {
      algorithms: ['RS256'],
      issuer: APPLE_ISSUER,
      audience: config.apple.clientId,
    })

    return {
      success: true,
      user: {
        appleId: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified === 'true' || decoded.email_verified === true,
        isPrivateEmail: decoded.is_private_email === 'true' || decoded.is_private_email === true,
        realUserStatus: decoded.real_user_status,
      },
      rawPayload: decoded,
    }
  } catch (error) {
    console.error('Apple token verification failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to verify Apple token',
    }
  }
}

/**
 * Generate client secret for Apple OAuth
 * @returns {string} JWT client secret
 */
function generateAppleClientSecret() {
  const now = Math.floor(Date.now() / 1000)

  const claims = {
    iss: config.apple.teamId,
    iat: now,
    exp: now + (86400 * 180), // 180 days
    aud: APPLE_ISSUER,
    sub: config.apple.clientId,
  }

  return jwt.sign(claims, config.apple.privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: config.apple.keyId,
    },
  })
}

/**
 * Exchange Apple authorization code for tokens
 * @param {string} code - Authorization code from Apple
 * @param {string} redirectUri - Redirect URI used in the authorization request
 * @returns {Promise<Object>} Tokens and user data
 */
export async function exchangeAppleCode(code, redirectUri) {
  try {
    const clientSecret = generateAppleClientSecret()

    const params = new URLSearchParams({
      client_id: config.apple.clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    })

    const response = await fetch(APPLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        error: data.error_description || data.error,
      }
    }

    // Verify the identity token
    const verificationResult = await verifyAppleToken(data.id_token)

    if (!verificationResult.success) {
      return verificationResult
    }

    return {
      success: true,
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
      },
      user: verificationResult.user,
    }
  } catch (error) {
    console.error('Apple code exchange failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to exchange Apple authorization code',
    }
  }
}

/**
 * Process Apple Sign In callback data (handles both POST and token verification)
 * @param {Object} data - Callback data from Apple (code, id_token, user info)
 * @returns {Promise<Object>} Processed user data
 */
export async function processAppleCallback(data) {
  const { code, id_token, user } = data

  // If we have an identity token, verify it directly
  if (id_token) {
    const verificationResult = await verifyAppleToken(id_token)

    if (verificationResult.success && user) {
      // Apple only sends user info on first sign-in
      // Merge it with verified token data
      try {
        const userData = typeof user === 'string' ? JSON.parse(user) : user
        verificationResult.user = {
          ...verificationResult.user,
          firstName: userData.name?.firstName,
          lastName: userData.name?.lastName,
          fullName: userData.name ? `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim() : null,
        }
      } catch (e) {
        // User data parsing failed, continue with token data only
      }
    }

    return verificationResult
  }

  // If we only have code, exchange it for tokens
  if (code) {
    return await exchangeAppleCode(code, config.frontend.baseUrl + '/auth/apple/callback')
  }

  return {
    success: false,
    error: 'No valid authentication data provided',
  }
}

export default {
  verifyAppleToken,
  exchangeAppleCode,
  processAppleCallback,
}
