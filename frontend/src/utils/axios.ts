import axios from 'axios'
import { useToast } from '~/composables/toast'
import { useTokenStore } from '~/composables/token'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const tokenStore = useTokenStore()
const { showError } = useToast()

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
)

http.interceptors.response.use(
  response => response,
  (error) => {
    // Get error message from response or use a default message
    let errorMessage = 'An unexpected error occurred'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    else if (error.message) {
      errorMessage = error.message
    }

    // Show toast notification for all errors
    showError({
      title: 'Error',
      message: errorMessage,
    })

    // Handle unauthorized access specifically
    if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
      tokenStore.clearStorage()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export { http }
