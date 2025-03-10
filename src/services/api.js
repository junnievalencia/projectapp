import axios from 'axios'
import { authService } from './index'
import router from '../router'

// Create a base API instance
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Function to check if token is expired
const isTokenExpired = token => {
  if (!token) return true

  try {
    // Get payload from token (token structure: header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Check if token has expired
    return payload.exp < Date.now() / 1000
  } catch (error) {
    return true
  }
}

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')

    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          // Try to get a new token using the refresh token
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await authService.refreshToken(refreshToken)
            const newToken = response.data.token

            if (newToken) {
              localStorage.setItem('token', newToken)
              config.headers.Authorization = `Bearer ${newToken}`
            } else {
              // If refresh failed, redirect to login
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              router.push('/login')
              return Promise.reject('Session expired')
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem('token')
            router.push('/login')
            return Promise.reject('Session expired')
          }
        } catch (error) {
          // Failed to refresh token, redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          router.push('/login')
          return Promise.reject('Session expired')
        }
      } else {
        // Token is valid, add it to headers
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle token issues
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
      } else if (error.response.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Permission denied')
      }
    }
    return Promise.reject(error)
  }
)

export default api
