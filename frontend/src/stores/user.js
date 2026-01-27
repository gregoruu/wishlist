import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isRestoringSession: false,
    sessionRestored: false,
    restorePromise: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user
  },

  actions: {
    login(user, token) {
      this.user = user
      this.token = token
      this.sessionRestored = true
    },

    logout() {
      this.user = null
      this.token = null
      this.sessionRestored = true
      
      fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
      }).then(() => {
        window.location.href = '/'
      }).catch(err => {
        console.error('Logout failed:', err)
        window.location.href = '/'
      })
    },

    async restoreSession() {
      if (this.sessionRestored) return
      if (this.restorePromise) return this.restorePromise
      
      this.isRestoringSession = true
      
      this.restorePromise = (async () => {
        try {
          const response = await fetch('http://localhost:3000/api/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            this.user = data.user
            this.token = 'cookie'
          } else {
            this.user = null
            this.token = null
          }
        } catch (err) {
          console.error('Failed to restore session:', err)
          this.user = null
          this.token = null
        } finally {
          this.isRestoringSession = false
          this.sessionRestored = true
          this.restorePromise = null
        }
      })()
      
      return this.restorePromise
    }
  }
})
