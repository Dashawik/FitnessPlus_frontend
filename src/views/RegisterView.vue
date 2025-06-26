<template>
  <div class="form-container">
    <el-form
      ref="registrationForm"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="registration-form"
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

      <el-form-item label="First Name" prop="firstName">
        <el-input v-model="formData.firstName" placeholder="Enter your first name">
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Last Name" prop="lastName">
        <el-input v-model="formData.lastName" placeholder="Enter your last name">
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <User />
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
          placeholder="Confirm password"
          show-password
        >
          <template #prefix>
            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">
          <el-icon style="width: 1em; height: 1em; margin-right: 8px">
            <Check />
          </el-icon>
          Register
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Message, User, Lock, Check, Close } from '@element-plus/icons-vue'

import { registerApi } from '@/api/user'

export default {
  name: 'RegistrationForm',
  components: {
    Message,
    User,
    Lock,
    Check,
    Close,
  },
  data() {
    return {
      formData: {
        email: '',
        firstName: '',
        lastName: '',
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
        email: [
          { required: true, message: 'Please enter email', trigger: 'blur' },
          { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
        ],
        firstName: [
          { required: true, message: 'Please enter first name', trigger: 'blur' },
          { min: 2, message: 'First name must be at least 2 characters', trigger: 'blur' },
        ],
        lastName: [
          { required: true, message: 'Please enter last name', trigger: 'blur' },
          { min: 2, message: 'Last name must be at least 2 characters', trigger: 'blur' },
        ],
        password: [
          { required: true, message: 'Please enter password', trigger: 'blur' },
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
          { required: true, message: 'Please confirm password', trigger: 'blur' },
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
  methods: {
    checkPasswordStrength() {
      this.passwordStrength.length = this.formData.password.length >= 8
      this.passwordStrength.uppercase = /[A-Z]/.test(this.formData.password)
      this.passwordStrength.lowercase = /[a-z]/.test(this.formData.password)
      this.passwordStrength.number = /\d/.test(this.formData.password)
    },
    submitForm() {
      this.$refs.registrationForm.validate(async (valid) => {
        if (valid) {
          try {
            await registerApi(
              this.formData.firstName,
              this.formData.lastName,
              this.formData.email,
              this.formData.password,
            )
            ElMessage.success('Registration successful!')
            this.$router.push({
              path: '/confirmation',
              query: { email: this.formData.email },
            })
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
  padding-top: 72px; /* Відступ для фіксованого хедера */
}

.registration-form {
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
</style>
