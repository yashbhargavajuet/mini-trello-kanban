import { create } from 'zustand'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,

  // Set authentication token
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
    set({ token })
  },

  // Login action
  login: async (credentials) => {
    try {
      set({ isLoading: true })
      
      const response = await axios.post('/api/auth/login', credentials)
      const { user, token } = response.data

      get().setToken(token)
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })

      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Login failed'
      return { success: false, error: message }
    }
  },

  // Register action
  register: async (userData) => {
    try {
      set({ isLoading: true })
      
      const response = await axios.post('/api/auth/register', userData)
      const { user, token } = response.data

      get().setToken(token)
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })

      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Registration failed'
      return { success: false, error: message }
    }
  },

  // Logout action
  logout: () => {
    get().setToken(null)
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    })
  },

  // Check authentication status
  checkAuth: async () => {
    const token = get().token
    
    if (!token) {
      set({ isAuthenticated: false, isLoading: false })
      return
    }

    try {
      // Set token in axios headers
      get().setToken(token)
      
      const response = await axios.get('/api/auth/me')
      const { user } = response.data

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      get().logout()
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await axios.put('/api/users/me', updates)
      const { user } = response.data

      set({ user })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: message }
    }
  }
}))

// Initialize token in axios headers if it exists
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}