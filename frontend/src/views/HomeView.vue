<template>
  <div class="home-container">
    <h1 class="title">Welcome to Wishlist</h1>
    <p class="subtitle">
      Create wishlists, share them with friends, and let others surprise you with gifts.
    </p>

    <div class="actions">
      <RouterLink to="/register" class="btn primary">Get Started</RouterLink>
      <RouterLink to="/login" class="btn secondary">Log In</RouterLink>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>Create Wishlists</h3>
        <p>Organize your wishes and keep everything in one place.</p>
      </div>

      <div class="feature-card">
        <h3>Share With Friends</h3>
        <p>Invite others to view your wishlist and buy gifts for you.</p>
      </div>

      <div class="feature-card">
        <h3>Gift Without Spoilers</h3>
        <p>Buy items for someone without them seeing what you picked — surprises stay surprises.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  text-align: center;
}

.title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 60px;
}

.btn {
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 16px;
  text-decoration: none;
  transition: 0.2s;
}

.primary {
  background: #1e1e1e;
  color: white;
}

.primary:hover {
  background: #333;
}

.secondary {
  border: 2px solid #1e1e1e;
  color: #1e1e1e;
}

.secondary:hover {
  background: #1e1e1e;
  color: white;
}

.features {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.feature-card {
  width: 260px;
  padding: 20px;
  border-radius: 10px;
  background: #f7f7f7;
  text-align: center;
  transition: 0.2s;
}

.feature-card:hover {
  background: #ececec;
}

.feature-card h3 {
  margin-bottom: 10px;
}
</style>
