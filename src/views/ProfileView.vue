<template>
    <AppHeader />
    <div class="profile-page">
        <h2>Profile Settings</h2>
        <el-form :model="formData" :rules="rules" ref="profileForm" label-width="120px" class="profile-form">
            <el-form-item label="Email" prop="email">
                <el-input v-model="formData.email" placeholder="Enter email">
                    <template #prefix>
                        <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                            <Message />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item label="First Name" prop="firstName">
                <el-input v-model="formData.firstName" placeholder="Enter first name">
                    <template #prefix>
                        <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item label="Last Name" prop="lastName">
                <el-input v-model="formData.lastName" placeholder="Enter last name">
                    <template #prefix>
                        <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item label="Password" prop="password">
                <el-input v-model="formData.password" type="password" placeholder="Enter new password (optional)"
                    show-password @input="checkPasswordStrength">
                    <template #prefix>
                        <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
                <div class="password-requirements" v-if="formData.password">
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

            <el-form-item label="Confirm Password" prop="passwordConfirm" v-if="formData.password">
                <el-input v-model="formData.passwordConfirm" type="password" placeholder="Confirm new password"
                    show-password>
                    <template #prefix>
                        <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="saveProfile" :loading="isLoading">
                    <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                        <Check />
                    </el-icon>
                    Save Changes
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
import { Message, User, Lock, Check, Close } from '@element-plus/icons-vue'
import { updateUserAPI } from '@/api/user'
import AppHeader from '@/components/AppHeader.vue'

export default {
    name: 'ProfileView',
    components: {
        Message,
        User,
        Lock,
        Check,
        Close,
        AppHeader,
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
                    {
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback() // Allow empty password
                            } else if (
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
                    {
                        validator: (rule, value, callback) => {
                            if (!this.formData.password) {
                                callback() // Skip validation if no password
                            } else if (value !== this.formData.password) {
                                callback(new Error('Passwords do not match'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur',
                    },
                ],
            },
            isLoading: false,
        }
    },
    created() {
        const user = Cookies.get('user')
        if (user) {
            const data = JSON.parse(user)
            this.formData.email = data.email || ''
            this.formData.firstName = data.firstName || ''
            this.formData.lastName = data.lastName || ''
        }
    },
    methods: {
        checkPasswordStrength() {
            this.passwordStrength.length = this.formData.password.length >= 8
            this.passwordStrength.uppercase = /[A-Z]/.test(this.formData.password)
            this.passwordStrength.lowercase = /[a-z]/.test(this.formData.password)
            this.passwordStrength.number = /\d/.test(this.formData.password)
        },
        async saveProfile() {
            this.$refs.profileForm.validate(async (valid) => {
                if (valid) {
                    this.isLoading = true
                    try {
                        const userId = JSON.parse(Cookies.get('user')).id || 1 // Replace with actual user ID logic
                        const userData = {
                            email: this.formData.email,
                            firstName: this.formData.firstName,
                            lastName: this.formData.lastName,
                            password: this.formData.password || undefined, // Only send password if provided
                        }
                        await updateUserAPI(userId, userData)
                        Cookies.set('user', JSON.stringify({ ...JSON.parse(Cookies.get('user')), ...userData }))
                        ElMessage.success('Profile updated successfully')
                    } catch ({ response }) {
                        if (response?.data?.details) {
                            response.data.details.forEach((detail) => ElMessage.error(detail))
                        } else {
                            ElMessage.error('Failed to update profile. Please try again.')
                        }
                    } finally {
                        this.isLoading = false
                    }
                }
            })
        },
    },
}
</script>

<style scoped>
.profile-page {
    padding-top: 92px;
    max-width: 600px;
    margin: 0 auto;
}

.profile-page h2 {
    font-size: 2em;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
}

.profile-form {
    background: #fff;
    padding: 20px;
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