<script setup>
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <RouterLink to="/wishlists" class="logo">Wishlist</RouterLink>
    </div>

    <div class="nav-right">
      <RouterLink to="/wishlists" class="nav-link">My Wishlists</RouterLink>
      <button class="logout-btn" @click="userStore.logout">Logout</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #1e1e1e;
  color: white;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: #ddd;
  text-decoration: none;
  font-size: 16px;
  transition: 0.2s;
}

.nav-link:hover {
  color: white;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s;
}

.logout-btn:hover {
  color: white;
}
</style>
