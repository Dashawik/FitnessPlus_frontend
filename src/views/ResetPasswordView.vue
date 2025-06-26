<template>
  <div class="form-container">
    <div v-if="isLoading" class="loading">
      <el-icon style="width: 48px; height: 48px; margin-right: 8px" class="spinner">
        <Loading />
      </el-icon>
    </div>
    <div v-else-if="isSuccess" class="message">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px">
        <Check />
      </el-icon>
      <h2>Password Reset Successful</h2>
      <p>Your password has been successfully reset.</p>
      <p>You can now log in with your new password.</p>
      <div class="button-container">
        <el-button type="primary" @click="goToLogin">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <User />
          </el-icon>
          Go to Log In
        </el-button>
      </div>
    </div>
    <div v-else-if="isError" class="message error">
      <el-icon style="width: 48px; height: 48px; margin-bottom: 16px">
        <Warning />
      </el-icon>
      <h2>Password Reset Failed</h2>
      <p>Sorry, we couldn't reset your password.</p>
      <p>The reset link may be invalid or expired. Please try again or request a new link.</p>
    </div>
    <el-form
      v-else
      ref="resetPasswordForm"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="reset-password-form"
    >
      <h2>Reset Your Password</h2>
      <p>Enter a new password.</p>
      <el-form-item label="New Password" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="Enter new password"
          show-password
          @input="checkPasswordStrength"
        >
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Lock />
            </el-icon>
          </template>
        </el-input>
        <div class="password-requirements">
          <div :class="{ met: passwordStrength.length }" class="requirement">
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Check v-if="passwordStrength.length" />
              <Close v-else />
            </el-icon>
            At least 8 characters
          </div>
          <div :class="{ met: passwordStrength.uppercase }" class="requirement">
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Check v-if="passwordStrength.uppercase" />
              <Close v-else />
            </el-icon>
            Uppercase letter
          </div>
          <div :class="{ met: passwordStrength.lowercase }" class="requirement">
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Check v-if="passwordStrength.lowercase" />
              <Close v-else />
            </el-icon>
            Lowercase letter
          </div>
          <div :class="{ met: passwordStrength.number }" class="requirement">
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Check v-if="passwordStrength.number" />
              <Close v-else />
            </el-icon>
            Number
          </div>
        </div>
      </el-form-item>
      <el-form-item label="Confirm Password" prop="passwordConfirm">
        <el-input
          v-model="formData.passwordConfirm"
          type="password"
          placeholder="Confirm new password"
          show-password
        >
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <div class="button-container">
        <el-button type="primary" @click="submitForm">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <Check />
          </el-icon>
          Reset Password
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { Loading, Check, Warning, User, Lock, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { resetConfirmAPI } from '@/api/user'

export default {
  name: 'ResetPassword',
  components: {
    Loading,
    Check,
    Warning,
    User,
    Lock,
    Close,
  },
  data() {
    return {
      isLoading: false,
      isSuccess: false,
      isError: false,
      token: '',
      formData: {
        password: '',
        passwordConfirm: '',
      },
      passwordStrength: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
      },
      rules: {
        password: [
          { required: true, message: 'Please enter a password', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (
                value.length >= 8 &&
                /[A-Z]/.test(value) &&
                /[a-z]/.test(value) &&
                /\d/.test(value)
              ) {
                callback()
              } else {
                callback(new Error('Password does not meet requirements'))
              }
            },
            trigger: 'blur',
          },
        ],
        passwordConfirm: [
          { required: true, message: 'Please confirm your password', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.formData.password) {
                callback(new Error('Passwords do not match'))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    this.token = this.$route.params.token || ''
  },
  methods: {
    checkPasswordStrength() {
      this.passwordStrength.length = this.formData.password.length >= 8
      this.passwordStrength.uppercase = /[A-Z]/.test(this.formData.password)
      this.passwordStrength.lowercase = /[a-z]/.test(this.formData.password)
      this.passwordStrength.number = /\d/.test(this.formData.password)
    },
    async submitForm() {
      this.$refs.resetPasswordForm.validate(async (valid) => {
        if (valid) {
          this.isLoading = true
          try {
            await resetConfirmAPI(this.token, this.formData.password)
            this.isSuccess = true
            this.isError = false
            ElMessage.success('Password reset successful!')
          } catch (error) {
            this.isSuccess = false
            this.isError = true
            ElMessage.error(error.response?.data?.message || 'Failed to reset password')
          } finally {
            this.isLoading = false
          }
        } else {
          ElMessage.error('Please fill all fields correctly')
        }
      })
    },
    retryReset() {
      this.isError = false
      this.formData.password = ''
      this.formData.passwordConfirm = ''
      this.passwordStrength = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
      }
      this.$refs.resetPasswordForm.clearValidate()
    },
    goToLogin() {
      this.$router.push('/login')
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

.reset-password-form {
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
  margin-bottom: 12px;
  text-align: center;
}

strong {
  color: #409eff;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-input__inner {
  border-radius: 8px;
  padding: 12px;
}

.password-requirements {
  margin-top: 12px;
  font-size: 13px;
  color: #606266;
}

.requirement {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.requirement.met {
  color: #52c41a;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 16px;
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

.link-button {
  color: #409eff;
  font-size: 14px;
}

.link-button:hover {
  color: #165dff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .reset-password-form,
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
