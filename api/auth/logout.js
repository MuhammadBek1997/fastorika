import { backendApi } from '../utils/backendApi.js'
import { success, error, handleCors, parseBody } from '../utils/response.js'

export const config = {
  runtime: 'edge',
}

/**
 * Logout endpoint - invalidate session
 *
 * POST /api/auth/logout
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

    // Logout with main backend
    const result = await backendApi.logout(token)

    if (!result.success) {
      // Even if backend fails, we consider logout successful on client side
      console.warn('Backend logout failed:', result.error)
    }

    return success({
      message: 'Logged out successfully',
    })

  } catch (err) {
    console.error('Logout error:', err)
    // Still return success as client should clear session anyway
    return success({
      message: 'Logged out successfully',
    })
  }
}
