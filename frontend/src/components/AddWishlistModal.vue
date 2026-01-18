<script setup>
import { ref, defineEmits } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['close', 'created'])
const userStore = useUserStore()

const step = ref(1)
const wishlistData = ref({
  title: '',
  description: ''
})

const itemUrl = ref('')
const itemData = ref({
  name: '',
  price: '',
  description: '',
  link: '',
  image: ''
})

const items = ref([])
const loading = ref(false)
const error = ref('')
const createdWishlistId = ref(null)

const parseUrl = async () => {
  if (!itemUrl.value) {
    error.value = 'Please enter a URL'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/parse-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      credentials: 'include',
      body: JSON.stringify({ url: itemUrl.value })
    })

    if (!response.ok) {
      throw new Error('Failed to parse URL')
    }

    const metadata = await response.json()
    
    itemData.value = {
      name: metadata.title,
      price: metadata.price,
      description: metadata.description,
      link: itemUrl.value,
      image: metadata.image
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const addItem = () => {
  if (!itemData.value.name) {
    error.value = 'Item name is required'
    return
  }

  items.value.push({ ...itemData.value })
  
  itemUrl.value = ''
  itemData.value = {
    name: '',
    price: '',
    description: '',
    link: '',
    image: ''
  }
  error.value = ''
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const createWishlist = async () => {
  if (!wishlistData.value.title) {
    error.value = 'Wishlist title is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const wishlistResponse = await fetch('http://localhost:3000/api/wishlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      credentials: 'include',
      body: JSON.stringify(wishlistData.value)
    })

    if (!wishlistResponse.ok) {
      throw new Error('Failed to create wishlist')
    }

    const wishlist = await wishlistResponse.json()
    createdWishlistId.value = wishlist.id
    
    step.value = 2
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const saveItems = async () => {
  loading.value = true
  error.value = ''

  try {
    for (const item of items.value) {
      const response = await fetch(`http://localhost:3000/api/wishlists/${createdWishlistId.value}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token}`
        },
        credentials: 'include',
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        throw new Error('Failed to add item')
      }
    }

    emit('created')
    emit('close')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      
      <h2 v-if="step === 1">Create New Wishlist</h2>
      <h2 v-else>Add Items to Wishlist</h2>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div v-if="step === 1" class="form">
        <div class="form-group">
          <label for="title">Wishlist Title *</label>
          <input
            id="title"
            v-model="wishlistData.title"
            type="text"
            placeholder="e.g., Birthday 2026"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="wishlistData.description"
            placeholder="Optional description..."
            rows="3"
          ></textarea>
        </div>

        <button @click="createWishlist" class="btn primary" :disabled="loading">
          {{ loading ? 'Creating...' : 'Next' }}
        </button>
      </div>

      <div v-else class="form">
        <div class="form-group">
          <label for="url">Paste Item URL</label>
          <div class="url-input-group">
            <input
              id="url"
              v-model="itemUrl"
              type="url"
              placeholder="https://example.com/product"
            />
            <button @click="parseUrl" class="btn secondary" :disabled="loading">
              {{ loading ? 'Parsing...' : 'Parse' }}
            </button>
          </div>
        </div>

        <div v-if="itemData.name" class="item-preview">
          <img v-if="itemData.image" :src="itemData.image" alt="Item" />
          <div class="item-details">
            <input v-model="itemData.name" placeholder="Item name" />
            <input v-model="itemData.price" placeholder="Price" />
            <textarea v-model="itemData.description" placeholder="Description" rows="2"></textarea>
          </div>
          <button @click="addItem" class="btn primary">Add to List</button>
        </div>

        <div v-if="items.length > 0" class="items-list">
          <h3>Items ({{ items.length }})</h3>
          <div v-for="(item, index) in items" :key="index" class="item-card">
            <img v-if="item.image" :src="item.image" alt="" />
            <div class="item-info">
              <strong>{{ item.name }}</strong>
              <span v-if="item.price">{{ item.price }} €</span>
            </div>
            <button @click="removeItem(index)" class="btn-remove">X</button>
          </div>
        </div>

        <div class="modal-actions">
          <button v-if="items.length > 0" @click="saveItems" class="btn primary" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save & Finish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
}

h2 {
  margin-bottom: 20px;
  color: #1e1e1e;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #1e1e1e;
}

input, textarea {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #1e1e1e;
}

.url-input-group {
  display: flex;
  gap: 10px;
}

.url-input-group input {
  flex: 1;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.primary {
  background: #1e1e1e;
  color: white;
}

.primary:hover:not(:disabled) {
  background: #333;
}

.secondary {
  background: #e0e0e0;
  color: #1e1e1e;
}

.secondary:hover {
  background: #d0d0d0;
}

.btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.item-preview {
  border: 2px solid #e0e0e0;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  gap: 15px;
	align-items: center;
}

.item-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-list {
  margin-top: 20px;
}

.items-list h3 {
  margin-bottom: 10px;
  color: #1e1e1e;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-card img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #c33;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 14px;
}
</style>
