<template>
    <AppHeader />
    <HeaderTabs />
    <div class="subscription-container">
        <div class="content-wrapper">
            <h2>Subscription Management</h2>
            <el-button type="success" size="small" @click="openAddDialog" class="add-button">
                <el-icon>
                    <Plus />
                </el-icon>
                Add Subscription
            </el-button>
            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
            <el-table v-else :data="subscriptions" style="width: 100%" border class="centered-table"
                :cell-style="{ textAlign: 'center', padding: '12px' }"
                :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', fontWeight: '500', padding: '12px' }">
                <el-table-column prop="id" label="ID" min-width="100"></el-table-column>
                <el-table-column prop="name" label="Name" min-width="200"></el-table-column>
                <el-table-column prop="price" label="Price" min-width="150"></el-table-column>
                <el-table-column prop="sessionLimit" label="Session Limit" min-width="150"></el-table-column>
                <el-table-column prop="createdAt" label="Created At" min-width="200">
                    <template #default="scope">
                        {{ formatDate(scope.row?.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="Updated At" min-width="200">
                    <template #default="scope">
                        {{ formatDate(scope.row?.updatedAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="Actions" min-width="300">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button type="primary" size="small" @click="openEditDialog(row)">
                                <el-icon style="margin-right: 8px">
                                    <Edit />
                                </el-icon>
                                Edit
                            </el-button>
                            <el-button type="danger" size="small" @click="deleteSubscription(row)">
                                <el-icon style="margin-right: 8px">
                                    <Delete />
                                </el-icon>
                                Delete
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog title="Edit Subscription" v-model="editDialogVisible" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form ref="editForm" :model="editFormData" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="editFormData.name" placeholder="Enter subscription name">
                            <template #prefix>
                                <el-icon>
                                    <Document />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Price" prop="price">
                        <el-input v-model="editFormData.price" type="text" placeholder="Enter price">
                            <template #prefix>
                                <el-icon>
                                    <Coin />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Session Limit" prop="sessionLimit">
                        <el-input v-model="editFormData.sessionLimit" type="text" placeholder="Enter session limit">
                            <template #prefix>
                                <el-icon>
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="editDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveSubscription">
                            <el-icon style="margin-right: 8px">
                                <Check />
                            </el-icon>
                            Save
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <el-dialog title="Add Subscription" v-model="addDialogVisible" width="30%" :before-close="handleCloseDialog"
                class="centered-dialog">
                <el-form ref="addForm" :model="newSubscription" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="newSubscription.name" placeholder="Enter subscription name">
                            <template #prefix>
                                <el-icon>
                                    <Document />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Price" prop="price">
                        <el-input v-model="newSubscription.price" type="text" placeholder="Enter price">
                            <template #prefix>
                                <el-icon>
                                    <Coin />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Session Limit" prop="sessionLimit">
                        <el-input v-model="newSubscription.sessionLimit" type="text" placeholder="Enter session limit">
                            <template #prefix>
                                <el-icon>
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="saveNewSubscription">
                            <el-icon style="margin-right: 8px">
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
import { Edit, Delete, Document, Check, Plus, Coin, User } from '@element-plus/icons-vue'
import HeaderTabs from '@/components/HeaderTabs.vue'
import AppHeader from '@/components/AppHeader.vue'


import {
    getSubscriptionListAPI,
    createSubscriptionAPI,
    updateSubscriptionAPI,
    deleteSubscriptionAPI,
} from '@/api/subscription/template.js'

export default {
    name: 'SubscriptionTemplate',
    components: {
        Edit,
        Delete,
        Document,
        Check,
        Plus,
        Coin,
        User,
        HeaderTabs,
        AppHeader
    },
    data() {
        return {
            isLoading: false,
            subscriptions: [],
            editDialogVisible: false,
            addDialogVisible: false,
            editFormData: {
                id: null,
                name: '',
                price: '',
                sessionLimit: '',
            },
            newSubscription: {
                name: '',
                price: '',
                sessionLimit: '',
            },
            editRules: {
                name: [
                    { required: true, message: 'Name is required', trigger: 'blur' },
                    { min: 2, message: 'Name must be at least 2 characters long', trigger: 'blur' },
                    { max: 50, message: 'Name must be no more than 50 characters long', trigger: 'blur' },
                ],
                price: [
                    { required: true, message: 'Price is required', trigger: 'blur' },
                ],
                sessionLimit: [
                    { required: true, message: 'Session limit is required', trigger: 'blur' },
                ],
            },
        }
    },
    created() {
        this.fetchSubscriptions()
    },
    methods: {
        formatDate(date) {
            return date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'
        },
        async fetchSubscriptions() {
            this.isLoading = true
            try {
                const response = await getSubscriptionListAPI()
                this.subscriptions = response || []
                console.log(response);

            } catch ({ response }) {
                if (response?.data?.details) {
                    response.data.details.forEach((detail) => {
                        ElMessage.error(detail)
                    })
                } else {
                    ElMessage.error('An error occurred, please try again later')
                }
            } finally {
                this.isLoading = false
            }
        },
        openEditDialog(subscription) {
            this.editFormData = { id: subscription.id, name: subscription.name, price: subscription.price?.toString() || '', sessionLimit: subscription.sessionLimit?.toString() || '' }
            this.editDialogVisible = true
        },
        async saveSubscription() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await updateSubscriptionAPI(this.editFormData.id, {
                            name: this.editFormData.name,
                            price: parseInt(this.editFormData.price),
                            sessionLimit: parseInt(this.editFormData.sessionLimit),
                        })
                        ElMessage.success('Subscription updated successfully')
                        this.editDialogVisible = false
                        this.fetchSubscriptions()
                    } catch ({ response }) {
                        if (response?.data?.details) {
                            response.data.details.forEach((detail) => {
                                ElMessage.error(detail)
                            })
                        } else {
                            ElMessage.error('An error occurred, please try again later')
                        }
                    }
                }
            })
        },
        async deleteSubscription(subscription) {
            this.$confirm('Are you sure you want to delete this subscription?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }).then(async () => {
                try {
                    await deleteSubscriptionAPI(subscription.id)
                    ElMessage.success('Subscription deleted successfully')
                    this.fetchSubscriptions()
                } catch ({ response }) {
                    if (response?.data?.details) {
                        response.data.details.forEach((detail) => {
                            ElMessage.error(detail)
                        })
                    } else {
                        ElMessage.error('An error occurred, please try again later')
                    }
                }
            })
        },
        openAddDialog() {
            this.newSubscription = { name: '', price: '', sessionLimit: '' }
            this.addDialogVisible = true
        },
        async saveNewSubscription() {
            this.$refs.addForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await createSubscriptionAPI({
                            name: this.newSubscription.name,
                            price: parseInt(this.newSubscription.price),
                            sessionLimit: parseInt(this.newSubscription.sessionLimit),
                        })
                        ElMessage.success('Subscription added successfully')
                        this.addDialogVisible = false
                        this.fetchSubscriptions()
                    } catch ({ response }) {
                        if (response?.data?.details) {
                            response.data.details.forEach((detail) => {
                                ElMessage.error(detail)
                            })
                        } else {
                            ElMessage.error('An error occurred, please try again later')
                        }
                    }
                }
            })
        },
        handleCloseDialog(done) {
            this.$confirm('Are you sure you want to close this dialog?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(() => {
                done()
            })
        },
    },
}
</script>

<style scoped>
.subscription-container {
    width: 100%;
    padding-left: 24px;
    padding-right: 24px;
    min-height: 100vh;
    display: flex;
    justify-content: center;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    padding-top: 0;
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

.add-button {
    margin-bottom: 16px;
    align-self: flex-start;
    width: 200px;
}

.add-button :deep(.el-icon) {
    width: 1em;
    height: 1em;
    margin-right: 8px;
}

.el-button :deep(.el-icon) {
    margin-right: 8px;
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
    .subscription-container {
        padding: 16px;
    }

    .content-wrapper {
        padding-top: 0;
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

    .add-button {
        width: 180px;
    }

    .add-button :deep(.el-icon) {
        width: 0.9em;
        height: 0.9em;
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