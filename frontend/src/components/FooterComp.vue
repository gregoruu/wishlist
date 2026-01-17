<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="brand">Wishlist © {{ new Date().getFullYear() }}</p>

      <div class="footer-links">
        <RouterLink to="/about" class="footer-link">About</RouterLink>
        <RouterLink to="/contact" class="footer-link">Contact</RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: black;
  color: #ccc;
  padding: 20px 0;
  margin-top: 60px;
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: 14px;
  color: #aaa;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
}

.footer-link:hover {
  color: white;
}
</style>
