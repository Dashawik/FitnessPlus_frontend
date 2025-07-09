<template>
    <HeaderTabs />
    <div class="user-management-container">
        <div class="content-wrapper">
            <h2>User Management</h2>
            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
            <el-table v-else :data="users" style="width: 100%" border class="centered-table"
                :cell-style="{ textAlign: 'center', padding: '12px' }"
                :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', fontWeight: '500', padding: '12px' }">
                <el-table-column prop="firstName" label="First Name" min-width="180"></el-table-column>
                <el-table-column prop="lastName" label="Last Name" min-width="180"></el-table-column>
                <el-table-column prop="email" label="Email" min-width="250"></el-table-column>
                <el-table-column prop="role" label="Role" min-width="120"></el-table-column>
                <el-table-column label="Actions" min-width="300">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button type="primary" size="small" @click="openEditDialog(row)">
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <Edit />
                                </el-icon>
                                Edit
                            </el-button>
                            <el-button type="danger" size="small" @click="deleteUser(row)">
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <Delete />
                                </el-icon>
                                Delete
                            </el-button>
                            <el-button type="warning" size="small" @click="resetAuth(row)">
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <Refresh />
                                </el-icon>
                                Reset Auth
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Діалог редагування -->
            <el-dialog title="Edit User" v-model="editDialogVisible" width="30%" :before-close="handleCloseDialog"
                class="centered-dialog">
                <el-form ref="editUserForm" :model="editFormData" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="First Name" prop="firstName">
                        <el-input v-model="editFormData.firstName" placeholder="Enter first name">
                            <template #prefix>
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Last Name" prop="lastName">
                        <el-input v-model="editFormData.lastName" placeholder="Enter last name">
                            <template #prefix>
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Email" prop="email">
                        <el-input v-model="editFormData.email" placeholder="Enter email">
                            <template #prefix>
                                <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                    <Message />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Role" prop="role">
                        <el-select v-model="editFormData.role" placeholder="Select role" class="centered-select">
                            <el-option label="User" value="USER"></el-option>
                            <el-option label="Trainer" value="TRAINER"></el-option>
                            <el-option label="Admin" value="ADMIN"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="editDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveUser">
                            <el-icon style="width: 1em; height: 1em; margin-right: 8px">
                                <Check />
                            </el-icon>
                            Save
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Edit, Delete, Refresh, User, Message, Check } from '@element-plus/icons-vue'
import { getUserListAPI, deleteUserAPI, updateUserAPI, resetAuthAPI } from '@/api/user'

import HeaderTabs from '@/components/HeaderTabs.vue'

export default {
    name: 'UserManagement',
    components: {
        Edit,
        Delete,
        Refresh,
        User,
        Message,
        Check,
        HeaderTabs
    },
    data() {
        return {
            isLoading: false,
            users: [],
            editDialogVisible: false,
            editFormData: {
                id: null,
                firstName: '',
                lastName: '',
                email: '',
                role: ''
            },
            editRules: {
                firstName: [
                    { required: true, message: 'First name is required', trigger: 'blur' },
                    { min: 2, message: 'First name must be at least 2 characters long', trigger: 'blur' },
                    { max: 32, message: 'First name must be no more than 32 characters long', trigger: 'blur' }
                ],
                lastName: [
                    { required: true, message: 'Last name is required', trigger: 'blur' },
                    { min: 2, message: 'Last name must be at least 2 characters long', trigger: 'blur' },
                    { max: 32, message: 'Last name must be no more than 32 characters long', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: 'Email is required', trigger: 'blur' },
                    { type: 'email', message: 'Email must be in a valid email format', trigger: 'blur' }
                ],
                role: [
                    { required: true, message: 'Role is required', trigger: 'change' }
                ]
            }
        }
    },
    created() {
        this.fetchUsers()
    },
    methods: {
        async fetchUsers() {
            this.isLoading = true
            try {
                const data = await getUserListAPI()
                this.users = data
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
        openEditDialog(user) {
            this.editFormData = { ...user }
            this.editDialogVisible = true
        },
        async saveUser() {
            this.$refs.editUserForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await updateUserAPI(this.editFormData.id, this.editFormData)
                        ElMessage.success('User updated successfully')
                        this.editDialogVisible = false
                        this.fetchUsers()
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
                }
            })
        },
        async deleteUser(user) {
            this.$confirm('Are you sure you want to delete this user?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                try {
                    await deleteUserAPI(user.id)
                    ElMessage.success('User deleted successfully')
                    this.fetchUsers()
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
            })
        },
        async resetAuth(user) {
            this.$confirm('Are you sure you want to reset authentication for this user?', 'Warning', {
                confirmButtonText: 'Reset',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                try {
                    await resetAuthAPI(user.id)
                    ElMessage.success('Authentication reset successfully')
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
            })
        },
        handleCloseDialog(done) {
            this.$confirm('Are you sure you want to close this dialog?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning'
            }).then(() => {
                done()
            })
        }
    }
}
</script>

<style scoped>
.user-management-container {
    width: 100%;
    padding-left: 24px;
    padding-right: 24px;
    min-height: 100vh;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

h2 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
}

.skeleton-wrapper {
    width: 100%;
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.centered-table {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    overflow-x: auto;
    table-layout: fixed;
}

.centered-table :deep(.el-table__body-wrapper),
.centered-table :deep(.el-table__header-wrapper) {
    width: 100% !important;
    overflow: hidden;
}

.centered-table :deep(.el-table__row) {
    display: table-row;
    width: 100%;
}

.centered-table :deep(.el-table__cell) {
    padding: 12px;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    width: 100%;
}

.el-button {
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.el-button:hover {
    background-color: #165dff;
}

.el-input__inner {
    border-radius: 8px;
    padding: 12px;
}

.el-select {
    width: 100%;
}

.centered-dialog .el-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.centered-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.centered-form .el-form-item {
    width: 80%;
    text-align: center;
}

.centered-select .el-select {
    width: 80%;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 80%;
}

@media (max-width: 768px) {
    .user-management-container {
        padding: 16px;
        padding-top: 80px;
    }

    h2 {
        font-size: 20px;
    }

    .centered-table {
        font-size: 14px;
    }

    .el-button {
        padding: 6px 8px;
        font-size: 12px;
    }

    .centered-form .el-form-item {
        width: 90%;
    }

    .centered-select .el-select {
        width: 90%;
    }

    .dialog-footer {
        width: 90%;
    }
}
</style>