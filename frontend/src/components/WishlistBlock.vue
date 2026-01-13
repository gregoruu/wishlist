<script setup>
defineProps({
  title: String,
  description: String,
  itemCount: Number,
  id: Number
})
</script>


<template>
  <div class="wishlist-block">
    <div class="wishlist-info">
      <h3>{{ title }}</h3>
      <p class="description">{{ description }}</p>
      <p class="count">Items: {{ itemCount }}</p>
    </div>
    <RouterLink :to="`/wishlists/${id}`" class="open-btn">
      Open
    </RouterLink>
  </div>
</template>

<style scoped>

.wishlist-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 10px;
  background: #f7f7f7;
  transition: 0.2s;
}

.wishlist-info {
  flex: 1;
}

.description {
  margin-top: 4px;
  margin-bottom: 8px;
}

.wishlist-block:hover {
  background: #ececec;
}

.open-btn {
  color: #1e1e1e;
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 24px;
  background: #e0e0e0;
  padding: 16px 36px;
  border-radius: 10px;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, transform 0.1s;
  cursor: pointer;
}

.open-btn:hover {
  background: #d1d1d1;
  transform: scale(1.04);
}

.open-btn:hover {
  background: #d1d1d1;
}
</style>
