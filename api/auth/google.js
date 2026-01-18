import { verifyGoogleToken, exchangeGoogleCode } from '../services/googleAuth.js'
import { backendApi } from '../utils/backendApi.js'
import { success, error, handleCors, parseBody } from '../utils/response.js'

export const config = {
  runtime: 'edge',
}

/**
 * Google OAuth authentication endpoint
 *
 * Accepts either:
 * - id_token: Google ID token from frontend (GoogleLogin component)
 * - code: Authorization code for server-side flow
 *
 * POST /api/auth/google
 */
export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  // Only accept POST requests
  if (request.method !== 'POST') {
    return error('Method not allowed', 405)
  }

  try {
    const body = await parseBody(request)
    const { credential, id_token, code, redirect_uri } = body

    // The credential from @react-oauth/google is the id_token
    const idToken = credential || id_token

    let googleResult

    // Verify ID token directly
    if (idToken) {
      googleResult = await verifyGoogleToken(idToken)
    }
    // Exchange authorization code for tokens
    else if (code) {
      googleResult = await exchangeGoogleCode(code, redirect_uri)
    }
    else {
      return error('Missing authentication credentials (credential, id_token, or code)', 400)
    }

    // Check if Google verification succeeded
    if (!googleResult.success) {
      return error(googleResult.error || 'Google authentication failed', 401)
    }

    // Send user data to main backend for registration/login
    const backendResult = await backendApi.googleAuth(googleResult.user)

    if (!backendResult.success) {
      return error(
        backendResult.error || 'Backend authentication failed',
        backendResult.status || 500
      )
    }

    // Return success response with backend session data
    return success({
      message: 'Google authentication successful',
      user: {
        ...googleResult.user,
        // Include any additional data from backend
        ...backendResult.data?.user,
      },
      session: backendResult.data?.session,
      token: backendResult.data?.token,
      refreshToken: backendResult.data?.refreshToken,
    })

  } catch (err) {
    console.error('Google auth error:', err)
    return error('Internal server error', 500)
  }
}
