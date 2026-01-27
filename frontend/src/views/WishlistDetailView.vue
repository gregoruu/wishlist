<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import WishlistItem from '@/components/WishlistItem.vue'
import AddItemModal from '@/components/AddItemModal.vue'

const route = useRoute()
const router = useRouter()

const wishlist = ref(null)
const items = ref([])
const showAddItem = ref(false)
const loading = ref(true)
const error = ref('')

const editingWishlist = ref(false)
const handleItemAdded = () => {
	showAddItem.value = false
	fetchWishlist()
}
const editForm = ref({
  title: '',
  description: ''
})

const fetchWishlist = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to load wishlist details')
    }

    const data = await response.json()
    wishlist.value = data
    items.value = data.items || []
    
    editForm.value = {
      title: data.title,
      description: data.description || ''
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  editingWishlist.value = true
}

const cancelEdit = () => {
  editingWishlist.value = false
  editForm.value = {
    title: wishlist.value.title,
    description: wishlist.value.description || ''
  }
}

const saveWishlist = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(editForm.value)
    })

    if (!response.ok) {
      throw new Error('Failed to update wishlist')
    }

    const data = await response.json()
    wishlist.value = data
    editingWishlist.value = false
  } catch (err) {
    error.value = err.message
  }
}

const deleteWishlist = async () => {
  if (!confirm('Are you sure you want to delete this wishlist?')) {
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to delete wishlist')
    }

    router.push('/wishlists')
  } catch (err) {
    error.value = err.message
  }
}

const deleteItem = async (itemId) => {
  if (!confirm('Are you sure you want to delete this item?')) {
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to delete item')
    }

    items.value = items.value.filter(item => item.id !== itemId)
  } catch (err) {
    error.value = err.message
  }
}

const togglePurchased = async (item) => {
  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}/items/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        purchased: !item.purchased
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update item')
    }

    item.purchased = !item.purchased
  } catch (err) {
    error.value = err.message
  }
}

const editItem = async (itemData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/wishlists/${route.params.id}/items/${itemData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        link: itemData.link
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update item')
    }

    const updatedItem = await response.json()
    const index = items.value.findIndex(item => item.id === itemData.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  } catch (err) {
    error.value = err.message
  }
}

onMounted(() => {
  fetchWishlist()
})
</script>

<template>
  <NavBar />
  <div class="page-container">
    <div v-if="loading" class="loading">Loading Items</div>
    
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <div v-else class="detail-container">
      <div class="wishlist-header">
        <div v-if="!editingWishlist" class="header-view">
          <div class="header-content">
            <h1>{{ wishlist.title }}</h1>
            <p class="description">{{ wishlist.description }}</p>
          </div>
          
          <div class="actions">
						<button @click="showAddItem = true" class="btn primary">Add an Item</Button>
            <button @click="startEdit" class="btn secondary">Edit</button>
            <button @click="deleteWishlist" class="btn danger">Delete Wishlist</button>
          </div>
        </div>

        <div v-else class="header-edit">
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              id="title"
              v-model="editForm.title" 
              type="text" 
              placeholder="Wishlist title"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              v-model="editForm.description" 
              placeholder="Description (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="actions">
            <button @click="saveWishlist" class="btn primary">Save</button>
            <button @click="cancelEdit" class="btn secondary">Cancel</button>
          </div>
        </div>
      </div>

      <div class="items-section">
        <h2>Items ({{ items.length }})</h2>
        
        <div v-if="items.length === 0" class="empty-state">
          No items yet. Add some items to your wishlist!
        </div>

        <div v-else class="items-grid">
          <WishlistItem
            v-for="item in items" 
            :key="item.id" 
            :item="item"
            @delete="deleteItem"
            @toggle-purchased="togglePurchased"
            @edit="editItem"
          />
        </div>
      </div>
    </div>
		<AddItemModal 
  		v-if="showAddItem"
  		:wishlistId="route.params.id"
 			@close="showAddItem = false"
  		@created="handleItemAdded"
		/>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.wishlist-header {
  background: #f7f7f7;
  padding: 30px;
  border-radius: 12px;
}

.header-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-view h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.header-content {
	flex: 1;
}

.description {
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e1e1e;
}

.items-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn.primary {
  background: #1e1e1e;
  color: white;
}

.btn.primary:hover {
  background: #333;
}

.btn.secondary {
  background: #e0e0e0;
  color: #1e1e1e;
}

.btn.secondary:hover {
  background: #d1d1d1;
}

.btn.danger {
  background: #dc3545;
  color: white;
}

.btn.danger:hover {
  background: #c82333;
}
</style>
