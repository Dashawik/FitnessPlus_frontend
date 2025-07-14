<template>
  <header class="header">
    <div class="header-container">
      <div class="left-section">
        <router-link to="/home" class="logo">
          <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
        </router-link>
      </div>
      <nav class="nav">
        <template v-if="isAuthenticated">
          <el-dropdown class="dropdown">
            <template #default>
              <span class="greeting">
                Hello, {{ userName }}
              </span>
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">Profile Settings</el-dropdown-item>
                <el-dropdown-item @click="logout">Log Out</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="default" @click="$router.push('/login')">Log In</el-button>
          <el-button type="primary" @click="$router.push('/register')">Register</el-button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script>
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'

export default {
  name: 'AppHeader',
  data() {
    return {
      userName: 'User',
    }
  },
  created() {
    const user = Cookies.get('user')
    if (user) {
      const data = JSON.parse(user)
      this.userName = data.firstName + ' ' + data.lastName || 'User'
    }
  },
  computed: {
    isAuthenticated() {
      return Cookies.get('refreshToken') !== undefined
    },
  },
  methods: {
    logout() {
      Cookies.remove('refreshToken')
      Cookies.remove('accessToken')
      Cookies.remove('user')
      ElMessage.success('Logged out successfully')
      this.$router.push('/')
    },
  },
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

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-image {
  height: 40px;
  width: auto;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.greeting {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.greeting:hover {
  color: #165dff;
  background: #f0f7ff;
}

.el-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.el-button--default {
  color: #606266;
}

.el-button--default:hover {
  color: #165dff;
  background: #f0f7ff;
}

.el-button--primary {
  background: #409eff;
  color: #ffffff;
}

.el-button--primary:hover {
  background: #165dff;
}

.dropdown :deep(.el-dropdown-menu) {
  padding: 0;
}

.dropdown :deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  font-size: 14px;
}

.dropdown :deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f7ff;
  color: #165dff;
}

@media (max-width: 768px) {
  .header-container {
    padding: 12px 16px;
  }

  .logo-image {
    height: 32px;
  }

  .el-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .greeting {
    font-size: 13px;
    padding: 3px 6px;
  }

  .dropdown :deep(.el-dropdown-menu__item) {
    font-size: 13px;
  }
}
</style>
