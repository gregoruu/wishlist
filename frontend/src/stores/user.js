import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    login(user, token) {
      this.user = user
      this.token = token
    },

    logout() {
      this.user = null
      this.token = null
      fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
    },

    restoreSession() {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.login(JSON.parse(user), token)
      }
    }
  }
})
