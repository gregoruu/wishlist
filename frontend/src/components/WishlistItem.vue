<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'togglePurchased', 'edit'])

const editing = ref(false)
const editForm = ref({
  name: '',
  description: '',
  price: '',
  link: ''
})

const startEdit = () => {
  editing.value = true
  editForm.value = {
    name: props.item.name,
    description: props.item.description || '',
    price: props.item.price || '',
    link: props.item.link || ''
  }
}

const cancelEdit = () => {
  editing.value = false
}

const saveEdit = () => {
  emit('edit', {
    id: props.item.id,
    ...editForm.value
  })
  editing.value = false
}

const handleDelete = () => {
  emit('delete', props.item.id)
}

const handleTogglePurchased = () => {
  emit('togglePurchased', props.item)
}
</script>

<template>
  <div 
    class="item-card"
    :class="{ purchased: item.purchased, editing: editing }"
  >
    <div v-if="!editing" class="item-content">
      <div class="item-info">
        <img 
          v-if="item.image" 
          :src="item.image" 
          :alt="item.name"
          class="item-image"
        />
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p v-if="item.description" class="item-description">{{ item.description }}</p>
          <p v-if="item.price" class="item-price">€{{ parseFloat(item.price).toFixed(2) }}</p>
          <a v-if="item.link" :href="item.link" target="_blank" class="item-link">Original Link</a>
        </div>
      </div>
      
      <div class="item-actions">
        <button 
          @click="handleTogglePurchased" 
          class="btn small"
          :class="item.purchased ? 'secondary' : 'primary'"
        >
          {{ item.purchased ? 'Purchased' : 'Mark Purchased' }}
        </button>
        <button @click="startEdit" class="btn small secondary">Edit</button>
        <button @click="handleDelete" class="btn small danger">Delete</button>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="edit-form">
      <div class="form-row">
        <div class="form-group">
          <label>Name</label>
          <input v-model="editForm.name" type="text" placeholder="Item name" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="editForm.description" placeholder="Description (optional)" rows="2"></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label>Price</label>
          <input v-model="editForm.price" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group half">
          <label>Link</label>
          <input v-model="editForm.link" type="url" placeholder="https://..." />
        </div>
      </div>

      <div class="edit-actions">
        <button @click="saveEdit" class="btn small primary">Save</button>
        <button @click="cancelEdit" class="btn small secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  padding: 20px;
  border-radius: 10px;
  background: #f7f7f7;
  transition: 0.2s;
}

.item-card:hover {
  background: #ececec;
}

.item-card.purchased {
  opacity: 0.6;
}

.item-card.editing {
  background: #fff;
  border: 2px solid #1e1e1e;
}

.item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details h3 {
  font-size: 18px;
  margin-bottom: 6px;
}

.item-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: black;
  margin-bottom: 6px;
}

.item-link {
  color: black;
  text-decoration: none;
  font-size: 14px;
}

.item-link:hover {
  text-decoration: underline;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-left: 24px;
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

.btn.small {
  padding: 10px 20px;
  font-size: 14px;
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.half {
  flex: 0 0 calc(50% - 8px);
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e1e1e;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
