import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Create a custom axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Updated to match API_URL in .env and quasar.config.js
  timeout: 5000
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('jwt_token')
      // You might want to redirect to login page here
    }
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
