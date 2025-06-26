<template>
  <div class="form-container">
    <el-form
      ref="loginForm"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="login-form"
    >
      <el-form-item label="Email" prop="email">
        <el-input v-model="formData.email" placeholder="Enter your email">
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Message />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="Enter password"
          show-password
        >
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item class="forgot-password">
        <router-link to="/forgotPassword" class="link"> Forgot Password? </router-link>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm"> Log In </el-button>
      </el-form-item>

      <el-form-item class="no-account">
        <span class="text">Don't have an account?</span>
        <router-link to="/register" class="link"> Register </router-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'

import Cookies from 'js-cookie'
import { loginApi } from '@/api/user'

export default {
  name: 'LoginForm',
  components: {
    Message,
    Lock,
  },
  data() {
    return {
      formData: {
        email: '',
        password: '',
      },
      rules: {
        email: [
          { required: true, message: 'Please enter email', trigger: 'blur' },
          { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
        ],
        password: [
          { required: true, message: 'Please enter password', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    submitForm() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          try {
            const data = await loginApi(this.formData.email, this.formData.password)
            Cookies.set('accessToken', data.tokens.access, { expires: 5 / (24 * 60) })
            Cookies.set('refreshToken', data.tokens.refresh, { expires: 30 })
            Cookies.set('user', JSON.stringify(data.user), { expires: 30 })
            ElMessage.success('Login successful!')
            this.$router.push({ path: '/home' })
          } catch ({ response }) {
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
        } else {
          ElMessage.error('Please fill all fields correctly')
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
  padding-top: 72px;
}

.login-form {
  max-width: 420px;
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-button:hover {
  background-color: #165dff;
}

.el-input__inner {
  border-radius: 8px;
  padding: 12px;
}

.forgot-password {
  margin-bottom: 16px;
  text-align: right;
}

.no-account {
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

.text {
  color: #606266;
  font-size: 14px;
}
</style>
