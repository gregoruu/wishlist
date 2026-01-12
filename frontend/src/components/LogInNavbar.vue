<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <RouterLink to="/" class="logo">Wishlist</RouterLink>
    </div>

    <div class="nav-right">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/login" class="nav-link">Login</RouterLink>
      <RouterLink to="/register" class="nav-link">Register</RouterLink>
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
</style>
