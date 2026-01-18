import { verifyAppleToken, processAppleCallback } from '../services/appleAuth.js'
import { backendApi } from '../utils/backendApi.js'
import { success, error, handleCors, parseBody } from '../utils/response.js'

export const config = {
  runtime: 'edge',
}

/**
 * Apple OAuth authentication endpoint
 *
 * Accepts:
 * - id_token: Apple identity token
 * - code: Authorization code (optional)
 * - user: User info JSON (only sent on first sign-in)
 *
 * POST /api/auth/apple
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
    const { id_token, code, user, authorization } = body

    // Handle authorization object from react-apple-signin-auth
    let appleResult

    if (authorization) {
      // Format from react-apple-signin-auth
      appleResult = await processAppleCallback({
        id_token: authorization.id_token,
        code: authorization.code,
        user,
      })
    } else if (id_token) {
      // Direct token verification
      appleResult = await verifyAppleToken(id_token)

      // Merge user info if provided (first sign-in only)
      if (appleResult.success && user) {
        try {
          const userData = typeof user === 'string' ? JSON.parse(user) : user
          appleResult.user = {
            ...appleResult.user,
            firstName: userData.name?.firstName,
            lastName: userData.name?.lastName,
            fullName: userData.name
              ? `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim()
              : null,
          }
        } catch (e) {
          // User parsing failed, continue with token data
        }
      }
    } else if (code) {
      // Code exchange flow
      appleResult = await processAppleCallback({ code, user })
    } else {
      return error('Missing authentication credentials (id_token, code, or authorization)', 400)
    }

    // Check if Apple verification succeeded
    if (!appleResult.success) {
      return error(appleResult.error || 'Apple authentication failed', 401)
    }

    // Send user data to main backend for registration/login
    const backendResult = await backendApi.appleAuth(appleResult.user)

    if (!backendResult.success) {
      return error(
        backendResult.error || 'Backend authentication failed',
        backendResult.status || 500
      )
    }

    // Return success response with backend session data
    return success({
      message: 'Apple authentication successful',
      user: {
        ...appleResult.user,
        // Include any additional data from backend
        ...backendResult.data?.user,
      },
      session: backendResult.data?.session,
      token: backendResult.data?.token,
      refreshToken: backendResult.data?.refreshToken,
    })

  } catch (err) {
    console.error('Apple auth error:', err)
    return error('Internal server error', 500)
  }
}
