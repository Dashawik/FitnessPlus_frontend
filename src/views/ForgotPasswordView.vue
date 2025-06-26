<template>
  <div class="form-container">
    <el-form
      ref="forgotPasswordForm"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="forgot-password-form"
    >
      <h2>Reset Your Password</h2>
      <p>Enter your email address to receive a password reset link.</p>
      <el-form-item label="Email" prop="email">
        <el-input v-model="formData.email" placeholder="Enter your email">
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Message />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <Check />
          </el-icon>
          Send Reset Link
        </el-button>
      </el-form-item>

      <el-form-item class="back-to-login">
        <router-link to="/login" class="link">
          Back to Log In
        </router-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

import { resetRquestAPI } from '@/api/user'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      formData: {
        email: '',
      },
      rules: {
        email: [
          { required: true, message: 'Please enter email', trigger: 'blur' },
          { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    submitForm() {
      this.$refs.forgotPasswordForm.validate(async (valid) => {
        if (valid) {
          try {
            await resetRquestAPI(this.formData.email)
            ElMessage.success('Password reset link sent!')
          } catch ({ response }) {
            if (response?.data?.details) {
              const { details } = response.data
              details.forEach((detail) => {
                ElMessage.error(detail)
              })
            } else {
              ElMessage.error('An error occurred, please try again later')
            }
          }
        } else {
          ElMessage.error('Please enter a valid email')
        }
      })
    },
  },
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 72px; /* Відступ для фіксованого хедера */
}

.forgot-password-form {
  max-width: 420px;
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.el-button:hover {
  background-color: #165dff;
}

.el-input__inner {
  border-radius: 8px;
  padding: 12px;
}

.back-to-login {
  margin-top: 8px;
  text-align: center;
}

.link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  color: #165dff;
}

@media (max-width: 480px) {
  .forgot-password-form {
    margin: 16px;
    padding: 16px;
  }

  h2 {
    font-size: 20px;
  }

  p {
    font-size: 14px;
  }
}
</style>
