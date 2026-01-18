import { processAppleCallback } from '../../services/appleAuth.js'
import { backendApi } from '../../utils/backendApi.js'
import { redirect, error, parseBody } from '../../utils/response.js'
import config from '../../config/index.js'

export const runtime = 'edge'

/**
 * Apple OAuth callback endpoint
 *
 * This handles the POST redirect from Apple after user authorization.
 * Apple sends form-urlencoded data to this endpoint.
 *
 * POST /api/auth/apple/callback
 */
export default async function handler(request) {
  // Apple sends a POST request with form data
  if (request.method !== 'POST') {
    return error('Method not allowed', 405)
  }

  try {
    const body = await parseBody(request)
    const { code, id_token, user, state, error: appleError } = body

    // Handle Apple errors
    if (appleError) {
      const errorUrl = new URL(config.frontend.baseUrl + config.frontend.errorRedirect)
      errorUrl.searchParams.set('error', appleError)
      errorUrl.searchParams.set('provider', 'apple')
      return redirect(errorUrl.toString())
    }

    // Process the Apple callback
    const appleResult = await processAppleCallback({ code, id_token, user })

    if (!appleResult.success) {
      const errorUrl = new URL(config.frontend.baseUrl + config.frontend.errorRedirect)
      errorUrl.searchParams.set('error', appleResult.error || 'Apple authentication failed')
      errorUrl.searchParams.set('provider', 'apple')
      return redirect(errorUrl.toString())
    }

    // Send user data to main backend
    const backendResult = await backendApi.appleAuth(appleResult.user)

    if (!backendResult.success) {
      const errorUrl = new URL(config.frontend.baseUrl + config.frontend.errorRedirect)
      errorUrl.searchParams.set('error', 'Backend authentication failed')
      errorUrl.searchParams.set('provider', 'apple')
      return redirect(errorUrl.toString())
    }

    // Redirect to frontend with success data
    const successUrl = new URL(config.frontend.baseUrl + config.frontend.successRedirect)
    successUrl.searchParams.set('provider', 'apple')

    // Pass token via URL parameter (or use httpOnly cookie in production)
    if (backendResult.data?.token) {
      successUrl.searchParams.set('token', backendResult.data.token)
    }

    // Include state if provided (for CSRF protection)
    if (state) {
      successUrl.searchParams.set('state', state)
    }

    return redirect(successUrl.toString())

  } catch (err) {
    console.error('Apple callback error:', err)
    const errorUrl = new URL(config.frontend.baseUrl + config.frontend.errorRedirect)
    errorUrl.searchParams.set('error', 'Internal server error')
    errorUrl.searchParams.set('provider', 'apple')
    return redirect(errorUrl.toString())
  }
}
