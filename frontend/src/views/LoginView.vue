<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  loading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.value.email,
        password: formData.value.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    userStore.login(data.user, data.token)
    router.push('/wishlists')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h1 class="title">Log In</h1>
    <p class="subtitle">
      Log in to your wishlist account.
    </p>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="formData.email" 
          type="email" 
          placeholder="Your email" 
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="formData.password" 
          type="password" 
          placeholder="Your password" 
          required
        />
      </div>

      <button type="submit" class="btn primary submit-btn" :disabled="loading">
        {{ loading ? 'Logging In...' : 'Log In' }}
      </button>
    </form>

    <p class="register-link">
      Don't have an account?
      <RouterLink to="/register" class="link">Sign Up</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.login-container {
  border-style: solid;
  max-width: 400px;
  margin: 0 auto;
  padding: 60px 50px;
  text-align: center;
}

.title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #1e1e1e;
}

.form-group input {
  padding: 12px;
  border-radius: 6px;
  border: 2px solid #ddd;
  font-size: 16px;
  transition: 0.2s;
}

.form-group input:focus {
  border-color: #1e1e1e;
  outline: none;
}

.btn {
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 16px;
  text-decoration: none;
  transition: 0.2s;
  cursor: pointer;
}

.primary {
  background: #1e1e1e;
  color: white;
}

.primary:hover {
  background: #333;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}

.register-link {
  margin-top: 30px;
  font-size: 15px;
  color: #666;
}

.link {
  color: #1e1e1e;
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #c33;
  font-size: 14px;
  margin-bottom: 20px;
}

.submit-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  background: #999;
}
</style>
