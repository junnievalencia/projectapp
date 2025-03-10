import api from './api'
import { jwtDecode } from 'jwt-decode'

const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise} - API response
   */
  login (credentials) {
    return api.post('/auth/login', credentials)
      .then(response => {
        // Store tokens and user data
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          // Store refresh token if available
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }
          // Store user data
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user))
          }
        }
        return response
      })
  },

  /**
   * Send OTP to user's phone/email during registration
   * @param {String} contact - User's phone number or email
   * @returns {Promise} - API response
   */
  sendOTP (contact) {
    return api.post('/auth/send-otp', { email: contact })
  },

  /**
   * Verify OTP code entered by user
   * @param {String} contact - User's phone number or email
   * @param {String} otpCode - OTP code entered by user
   * @returns {Promise} - API response
   */
  verifyOTP (contact, otpCode) {
    return api.post('/auth/verify-otp', { email: contact, otp: otpCode })
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register (userData) {
    return api.post('/auth/register', userData)
  },

  /**
   * Get current user profile
   * @returns {Promise} - API response
   */
  getCurrentUser () {
    return api.get('/auth/me')
  },

  /**
   * Logout the current user
   * @returns {Promise} - API response
   */
  logout () {
    // Make API call to invalidate token on server and handle any errors
    return api.post('/auth/logout')
      .then(result => {
        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return result
      })
      .catch(error => {
        // Still clear local storage even if server call fails
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return Promise.reject(error)
      })
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateProfile (userData) {
    return api.put('/auth/profile', userData)
  },

  /**
   * Refresh the access token using refresh token
   * @param {String} refreshToken - The refresh token
   * @returns {Promise} - API response with new tokens
   */
  refreshToken (refreshToken) {
    return api.post('/auth/refresh-token', { refreshToken })
  },

  /**
   * Get token expiration date
   * @returns {Date|null} - Expiration date or null if no token
   */
  getTokenExpirationDate () {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      if (decoded.exp === undefined) return null
      const date = new Date(0)
      date.setUTCSeconds(decoded.exp)
      return date
    } catch (error) {
      return null
    }
  },
  /**
   * Check if token is expired
   * @returns {Boolean} - True if token is expired or doesn't exist
   */
  isTokenExpired () {
    const expirationDate = this.getTokenExpirationDate()
    return !expirationDate || expirationDate < new Date()
  },

  /**
   * Check if user is authenticated with a valid non-expired token
   * @returns {Boolean}
   */
  isAuthenticated () {
    const token = localStorage.getItem('token')
    return !!token && !this.isTokenExpired()
  }
}

export default authService
