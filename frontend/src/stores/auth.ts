import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface AuthState {
  isAuthenticated: boolean
  user: null | {
    id: string
    full_name: string
    username: string
    organization_id: number
    organization: {
      id: number
      name: string
    }
    active: boolean
  }
}

const tokenStore = useTokenStore()

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: tokenStore.isAuthenticated(),
    user: tokenStore.getUser(),
  }),
  getters: {
    isLoggedIn: state => state.isAuthenticated,
    userInfo: state => state.user,
  },
  actions: {
    async login(username: string, password: string, rememberMe: boolean = false) {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }
      this.isAuthenticated = false
      this.user = null
      try {
        const response = await http.post('/auth/login', { username, password })

        const { token, user } = response.data
        tokenStore.setToStorage(token, JSON.stringify(user), rememberMe)
        this.isAuthenticated = true
        this.user = user
      }
      catch (error) {
        this.isAuthenticated = false
        this.user = null
        throw error
      }
    },
    async logout() {
      try {
        await http.post('/auth/logout')
      }
      finally {
        tokenStore.clearStorage()
        window.location.href = '/login'
      }
    },
  },

})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore as any, import.meta.hot))
