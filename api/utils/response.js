/**
 * Standard response utilities for Vercel serverless functions
 */

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

/**
 * Create success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Response} Vercel Response object
 */
export function success(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  )
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {Object} details - Additional error details
 * @returns {Response} Vercel Response object
 */
export function error(message, status = 400, details = {}) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      ...details,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  )
}

/**
 * Handle OPTIONS preflight requests
 * @returns {Response} Vercel Response object with CORS headers
 */
export function handleCors() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

/**
 * Parse request body
 * @param {Request} request - Incoming request
 * @returns {Promise<Object>} Parsed body
 */
export async function parseBody(request) {
  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return await request.json()
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      const data = {}
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }
      return data
    }

    // Try to parse as JSON anyway
    const text = await request.text()
    if (text) {
      return JSON.parse(text)
    }

    return {}
  } catch (e) {
    return {}
  }
}

/**
 * Redirect response
 * @param {string} url - Redirect URL
 * @param {number} status - HTTP status code (default: 302)
 * @returns {Response} Vercel Response object
 */
export function redirect(url, status = 302) {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      ...corsHeaders,
    },
  })
}

export default {
  success,
  error,
  handleCors,
  parseBody,
  redirect,
}
