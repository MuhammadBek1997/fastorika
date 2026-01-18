import config from '../config/index.js'
import jwt from 'jsonwebtoken'

/**
 * Main backend API client for communicating with the primary backend server
 * If main backend is not available, generates local JWT tokens
 */
class BackendApi {
  constructor() {
    this.baseUrl = config.mainBackend.baseUrl
    this.apiKey = config.mainBackend.apiKey
    this.jwtSecret = process.env.JWT_SECRET || 'fastorika-default-secret-change-in-production'
  }

  /**
   * Check if main backend is configured and available
   */
  isMainBackendConfigured() {
    return this.baseUrl && this.apiKey && this.apiKey !== 'your-backend-api-key'
  }

  /**
   * Generate local JWT token when main backend is not available
   */
  generateLocalToken(userData, provider) {
    const payload = {
      sub: userData.googleId || userData.appleId || userData.email,
      email: userData.email,
      name: userData.name || userData.fullName || userData.email?.split('@')[0],
      provider: provider,
      emailVerified: userData.emailVerified,
      iat: Math.floor(Date.now() / 1000),
    }

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' })
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, this.jwtSecret, { expiresIn: '30d' })

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    }
  }

  /**
   * Make HTTP request to main backend
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: data.message || data.error || 'Backend request failed',
          data,
        }
      }

      return {
        success: true,
        status: response.status,
        data,
      }
    } catch (error) {
      console.error(`Backend API request failed: ${endpoint}`, error)
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  /**
   * Register or authenticate user via Google OAuth
   * @param {Object} userData - User data from Google verification
   * @returns {Promise<Object>} Backend response with user session
   */
  async googleAuth(userData) {
    // If main backend not configured, generate local token
    if (!this.isMainBackendConfigured()) {
      console.log('Main backend not configured, generating local token for Google auth')
      const tokens = this.generateLocalToken(userData, 'google')
      return {
        success: true,
        data: {
          ...tokens,
          user: {
            id: userData.googleId,
            email: userData.email,
            name: userData.name,
            firstName: userData.firstName,
            lastName: userData.lastName,
            picture: userData.picture,
            provider: 'google',
            emailVerified: userData.emailVerified,
          }
        }
      }
    }

    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'google',
        providerId: userData.googleId,
        email: userData.email,
        emailVerified: userData.emailVerified,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        picture: userData.picture,
        locale: userData.locale,
      }),
    })
  }

  /**
   * Register or authenticate user via Apple OAuth
   * @param {Object} userData - User data from Apple verification
   * @returns {Promise<Object>} Backend response with user session
   */
  async appleAuth(userData) {
    // If main backend not configured, generate local token
    if (!this.isMainBackendConfigured()) {
      console.log('Main backend not configured, generating local token for Apple auth')
      const tokens = this.generateLocalToken(userData, 'apple')
      return {
        success: true,
        data: {
          ...tokens,
          user: {
            id: userData.appleId,
            email: userData.email,
            name: userData.fullName || userData.email?.split('@')[0],
            firstName: userData.firstName,
            lastName: userData.lastName,
            provider: 'apple',
            emailVerified: userData.emailVerified,
            isPrivateEmail: userData.isPrivateEmail,
          }
        }
      }
    }

    return this.request('/api/auth/apple', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'apple',
        providerId: userData.appleId,
        email: userData.email,
        emailVerified: userData.emailVerified,
        isPrivateEmail: userData.isPrivateEmail,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
      }),
    })
  }

  /**
   * Verify existing session token with backend
   * @param {string} token - Session token
   * @returns {Promise<Object>} Backend response with user data
   */
  async verifySession(token) {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  /**
   * Refresh user session
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Backend response with new tokens
   */
  async refreshSession(refreshToken) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  /**
   * Logout user and invalidate session
   * @param {string} token - Session token to invalidate
   * @returns {Promise<Object>} Backend response
   */
  async logout(token) {
    return this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  /**
   * Get user profile from backend
   * @param {string} token - Session token
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(token) {
    return this.request('/api/user/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  /**
   * Link OAuth provider to existing account
   * @param {string} token - Session token
   * @param {string} provider - OAuth provider (google/apple)
   * @param {Object} providerData - Provider-specific user data
   * @returns {Promise<Object>} Backend response
   */
  async linkProvider(token, provider, providerData) {
    return this.request('/api/auth/link-provider', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider,
        ...providerData,
      }),
    })
  }
}

// Export singleton instance
export const backendApi = new BackendApi()

export default backendApi
