<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
      </router-link>
      <nav class="nav">
        <router-link to="/login" class="nav-button">Log In</router-link>
        <router-link to="/register" class="nav-button primary">Register</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
}

.logo-image {
  height: 40px;
  width: auto;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-button {
  display: inline-block;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: #606266;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-button:hover {
  color: #165dff;
  background: #f0f7ff;
}

.nav-button.primary {
  background: #409eff;
  color: #ffffff;
}

.nav-button.primary:hover {
  background: #165dff;
  color: #ffffff;
}

@media (max-width: 768px) {
  .header-container {
    padding: 12px 16px;
  }

  .logo-image {
    height: 32px;
  }

  .nav-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>