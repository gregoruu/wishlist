<script setup>
import { ref } from 'vue'

const props = defineProps({
  wishlistId: [String, Number]
})

const emit = defineEmits(['close', 'created'])

const itemUrl = ref('')
const itemData = ref({
  name: '',
  price: '',
  description: '',
  link: '',
  image: ''
})

const loading = ref(false)
const error = ref('')
const showManualForm = ref(false)

const toggleManualForm = () => {
  showManualForm.value = !showManualForm.value
  if (showManualForm.value) {
    itemUrl.value = ''
  } else {
    itemData.value = {
      name: '',
      price: '',
      description: '',
      link: '',
      image: ''
    }
  }
}

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
        'Content-Type': 'application/json'
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

const saveItem = async () => {
  if (!itemData.value.name) {
    error.value = 'Item name is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${props.wishlistId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(itemData.value)
    })

    if (!response.ok) {
      throw new Error('Failed to add item')
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
      
      <h2>Add Item</h2>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form">
        <div v-if="!showManualForm" class="form-group">
          <label for="url">Paste Item URL</label>
          <div class="url-input-group">
            <input
              id="url"
              v-model="itemUrl"
              type="url"
              placeholder="https://..."
            />
            <button @click="parseUrl" class="btn secondary" :disabled="loading">
              {{ loading ? 'Parsing...' : 'Parse' }}
            </button>
          </div>
          <p class="toggle-link" @click="toggleManualForm">Add manually</p>
        </div>

        <div v-else class="manual-form">
          <p class="toggle-link" @click="toggleManualForm">Back to URL parser</p>
          
          <div class="form-group">
            <label for="manual-name">Item Name *</label>
            <input
              id="manual-name"
              v-model="itemData.name"
              type="text"
              placeholder="Item name"
            />
          </div>

          <div class="form-group">
            <label for="manual-price">Price</label>
            <input
              id="manual-price"
              v-model="itemData.price"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="manual-description">Description</label>
            <textarea
              id="manual-description"
              v-model="itemData.description"
              placeholder="Description (optional)"
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="manual-link">Link</label>
            <input
              id="manual-link"
              v-model="itemData.link"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label for="manual-image">Image URL</label>
            <input
              id="manual-image"
              v-model="itemData.image"
              type="url"
              placeholder="https://..."
            />
          </div>
        </div>

        <div v-if="itemData.name && !showManualForm" class="item-preview">
          <img v-if="itemData.image" :src="itemData.image" alt="Item" />
          <div class="item-details">
            <input v-model="itemData.name" placeholder="Item name" />
            <input v-model="itemData.price" placeholder="Price" />
            <textarea v-model="itemData.description" placeholder="Description" rows="2"></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button v-if="itemData.name" @click="saveItem" class="btn primary" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Item' }}
          </button>
          <button @click="$emit('close')" class="btn secondary">Cancel</button>
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
  font-family: inherit;
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
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn.primary {
  background: #1e1e1e;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #333;
}

.btn.secondary {
  background: #e0e0e0;
  color: #1e1e1e;
}

.btn.secondary:hover {
  background: #d0d0d0;
}

.btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.image-preview {
  display: flex;
  justify-content: center;
  padding: 10px;
  background: #f7f7f7;
  border-radius: 8px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 14px;
}

.toggle-link {
  color: black;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

.toggle-link:hover {
  text-decoration: underline;
}

.manual-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
</style>
