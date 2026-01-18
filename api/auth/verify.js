import { backendApi } from '../utils/backendApi.js'
import { success, error, handleCors, parseBody } from '../utils/response.js'

export const config = {
  runtime: 'edge',
}

/**
 * Verify session token endpoint
 *
 * POST /api/auth/verify
 */
export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'POST') {
    return error('Method not allowed', 405)
  }

  try {
    const body = await parseBody(request)
    const { token } = body

    if (!token) {
      return error('Token is required', 400)
    }

    // Verify with main backend
    const result = await backendApi.verifySession(token)

    if (!result.success) {
      return error(result.error || 'Invalid token', 401)
    }

    return success({
      valid: true,
      user: result.data?.user,
    })

  } catch (err) {
    console.error('Verify session error:', err)
    return error('Internal server error', 500)
  }
}
