/**
 * Authentication Service
 * Handles OAuth authentication with the intermediate backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Authenticate with Google
 * @param {Object} response - Response from GoogleLogin component
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateWithGoogle(response) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Google authentication failed')
    }

    // Store session token
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    }
  } catch (error) {
    console.error('Google authentication error:', error)
    return {
      success: false,
      error: error.message || 'Authentication failed',
    }
  }
}

/**
 * Authenticate with Apple
 * @param {Object} response - Response from Apple Sign In
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateWithApple(response) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorization: response.authorization,
        user: response.user,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Apple authentication failed')
    }

    // Store session token
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    }
  } catch (error) {
    console.error('Apple authentication error:', error)
    return {
      success: false,
      error: error.message || 'Authentication failed',
    }
  }
}

/**
 * Verify current session token
 * @returns {Promise<Object>} Verification result
 */
export async function verifySession() {
  const token = localStorage.getItem('authToken')

  if (!token) {
    return { success: false, error: 'No token found' }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      // Try to refresh the token
      const refreshResult = await refreshSession()
      return refreshResult
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Refresh session token
 * @returns {Promise<Object>} Refresh result
 */
export async function refreshSession() {
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    return { success: false, error: 'No refresh token found' }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      // Refresh failed, clear storage
      logout()
      throw new Error(data.error || 'Session expired')
    }

    // Update tokens
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }

    return {
      success: true,
      token: data.token,
    }
  } catch (error) {
    console.error('Session refresh error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Logout user
 * @returns {Promise<Object>} Logout result
 */
export async function logout() {
  const token = localStorage.getItem('authToken')

  try {
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  return { success: true }
}

/**
 * Get current user from storage
 * @returns {Object|null} User data or null
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

/**
 * Get current auth token
 * @returns {string|null} Auth token or null
 */
export function getAuthToken() {
  return localStorage.getItem('authToken')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem('authToken')
}

export default {
  authenticateWithGoogle,
  authenticateWithApple,
  verifySession,
  refreshSession,
  logout,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
}
