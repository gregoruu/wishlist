<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  name: '',
  email: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (formData.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
			credentials: 'include',
      body: JSON.stringify({
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        address: formData.value.address
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
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
  <div class="register-container">
    <h1 class="title">Create Your Account</h1>
    <p class="subtitle">
      Join Wishlist and start creating, sharing, and receiving gifts without spoilers.
    </p>

    <div v-if="error" class="error-message">
  {{ error }}
</div>

<form @submit.prevent="handleRegister" class="form">
  <div class="form-group">
    <label for="name">Name</label>
    <input 
      id="name"
      v-model="formData.name" 
      type="text" 
      placeholder="Your full name" 
      required
    />
  </div>

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
    <label for="address">Address</label>
    <input 
      id="address"
      v-model="formData.address" 
      type="text" 
      placeholder="Your address" 
			required
    />

  <div class="form-group">
    <label for="password">Password</label>
    <input 
      id="password"
      v-model="formData.password" 
      type="password" 
      placeholder="Create a password" 
      minlength="6"
      required
    />
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input 
      id="confirmPassword"
      v-model="formData.confirmPassword" 
      type="password" 
      placeholder="Confirm password" 
      minlength="6"
      required
    />
  </div>
  </div>

  <button type="submit" class="btn primary submit-btn" :disabled="loading">
    {{ loading ? 'Signing Up...' : 'Sign Up' }}
  </button>
</form>

    <p class="login-link">
      Already have an account?
      <RouterLink to="/login" class="link">Log In</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.register-container {
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

.login-link {
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
