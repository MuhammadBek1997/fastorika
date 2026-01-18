import { backendApi } from '../utils/backendApi.js'
import { success, error, handleCors, parseBody } from '../utils/response.js'

export const config = {
  runtime: 'edge',
}

/**
 * Refresh session token endpoint
 *
 * POST /api/auth/refresh
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
    const { refreshToken } = body

    if (!refreshToken) {
      return error('Refresh token is required', 400)
    }

    // Refresh with main backend
    const result = await backendApi.refreshSession(refreshToken)

    if (!result.success) {
      return error(result.error || 'Failed to refresh session', 401)
    }

    return success({
      token: result.data?.token,
      refreshToken: result.data?.refreshToken,
      expiresIn: result.data?.expiresIn,
    })

  } catch (err) {
    console.error('Refresh session error:', err)
    return error('Internal server error', 500)
  }
}
