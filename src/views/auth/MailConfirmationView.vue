<template>
  <div class="confirmation-container">
    <div v-if="isLoading" class="loading">
      <el-icon style="width: 48px; height: 48px; margin-right: 8px" class="spinner">
        <Loading />
      </el-icon>
    </div>
    <div v-else-if="isSuccess" class="message">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px; font-size: 50px">
        <Message />
      </el-icon>
      <h2>Confirmation Email Sent</h2>
      <p>
        A confirmation email has been sent to <strong>{{ email }}</strong
        >.
      </p>
      <p>Please check your inbox and follow the instructions to activate your account.</p>
      <p>Please check your spam or junk folder if you don't see the email.</p>
    </div>
    <div v-else class="message error">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px; font-size: 50px">
        <Warning />
      </el-icon>
      <h2>Failed to Send Confirmation Email</h2>
      <p>
        Sorry, we couldn't send the confirmation email to <strong>{{ email }}</strong
        >.
      </p>
      <p>Please try again later or contact support.</p>
      <div class="button-container">
        <el-button type="primary" @click="retryRequest">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <Refresh />
          </el-icon>
          Try Again
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Loading, Message, Warning, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { verificationRquestAPI } from '@/api/user'

export default {
  name: 'MailConfirmationView',
  components: {
    Loading,
    Message,
    Warning,
    Refresh,
  },
  data() {
    return {
      isLoading: true,
      isSuccess: false,
      email: '',
    }
  },
  created() {
    this.email = this.$route.query.email
    this.sendConfirmationRequest()
  },
  methods: {
    async sendConfirmationRequest() {
      this.isLoading = true
      try {
        await verificationRquestAPI(this.email)
        this.isSuccess = true
        ElMessage.success('Confirmation email sent!')
      } catch ({ response }) {
        if (response?.data?.details) {
          const { details } = response.data
          details.forEach((detail) => {
            ElMessage.error(detail)
          })
        } else {
          ElMessage.error('An error occurred, please try again later')
        }
      } finally {
        this.isLoading = false
      }
    },
    retryRequest() {
      this.sendConfirmationRequest()
    },
  },
}
</script>

<style scoped>
.confirmation-container {
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

  .el-icon {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
