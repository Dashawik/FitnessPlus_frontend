<template>
  <div class="verification-container">
    <div v-if="isLoading" class="loading">
      <el-icon style="width: 48px; height: 48px; margin-right: 8px" class="spinner">
        <Loading />
      </el-icon>
    </div>
    <div v-else-if="isVerified" class="message">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px">
        <Check />
      </el-icon>
      <h2>Email Verified</h2>
      <p>Your email has been successfully verified.</p>
      <p>You can now log in to your account.</p>
      <div class="button-container">
        <el-button type="primary" @click="goToLogin">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <User />
          </el-icon>
          Go to Log In
        </el-button>
      </div>
    </div>
    <div v-else class="message error">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px">
        <Warning />
      </el-icon>
      <h2>Verification Failed</h2>
      <p>Sorry, we couldn't verify your email.</p>
      <p>The verification link may be invalid or expired. Please try again or request a new link.</p>
    </div>
  </div>
</template>

<script>
import { Loading, Check, Warning, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import {verificationConfirmAPI} from '@/api/user'

export default {
  name: 'EmailVerification',
  components: {
    Loading,
    Check,
    Warning,
    User
  },
  data() {
    return {
      isLoading: true,
      isVerified: false,
      token: ''
    }
  },
  created() {
    this.token = this.$route.params.token || ''
    this.verifyEmail()
  },
  methods: {
    async verifyEmail() {
      this.isLoading = true
      try {
       await verificationConfirmAPI(this.token)
        this.isVerified = true
        ElMessage.success('Email verified successfully!')
        } catch ({ response }) {
          this.isVerified = false
            if (response?.data?.details) {
              const { details } = response.data
              details.forEach((detail) => {
                ElMessage.error(detail)
                if ((detail == 'Email not verified')) {
                  this.$router.push({
                    path: '/confirmation',
                    query: { email: this.formData.email },
                  })
                }
              })
            } else {
              ElMessage.error('An error occurred, please try again later')
            }
          }
      finally {
          this.isLoading = false
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.verification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 72px; 
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

.message {
  text-align: center;
  max-width: 420px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.message.error {
  background: #fff1f0;
}

h2 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

strong {
  color: #409eff;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.el-button {
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-button:hover {
  background-color: #165dff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .message {
    margin: 16px;
    padding: 16px;
  }

  h2 {
    font-size: 20px;
  }

  p {
    font-size: 14px;
  }

  .el-icon:not(.spinner) {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>