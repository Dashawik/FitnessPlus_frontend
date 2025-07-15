<template>
    <AppHeader />
    <HeaderTabs />
    <div class="subscriptions-container">
        <div class="content-wrapper">
            <h2>Subscription Management</h2>

            <el-input v-model="searchQuery" placeholder="Search by ID, name, or email" clearable class="search-input"
                prefix-icon="el-icon-search" style="margin-bottom: 16px; max-width: 400px" />

            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>

            <el-table v-else :data="filteredSubscriptions" style="width: 100%" border class="centered-table"
                :cell-style="{ textAlign: 'center', padding: '12px' }"
                :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', fontWeight: '500', padding: '12px' }">
                <el-table-column prop="id" label="Subscription ID" min-width="120" />
                <el-table-column prop="template.name" label="Plan" min-width="150" />
                <el-table-column label="Name" min-width="180">
                    <template #default="scope">
                        {{ scope.row.user.firstName }} {{ scope.row.user.lastName }}
                    </template>
                </el-table-column>
                <el-table-column prop="user.email" label="Email" min-width="220" />
                <el-table-column label="Start Date" min-width="200">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.startDate) }}
                    </template>
                </el-table-column>
                <el-table-column label="End Date" min-width="200">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.endDate) }}
                    </template>
                </el-table-column>
                <el-table-column prop="availableSessions" label="Available Sessions" min-width="150" />
                <el-table-column prop="isActive" label="Status" min-width="120">
                    <template #default="scope">
                        {{ scope.row.isActive ? 'Active' : 'Inactive' }}
                    </template>
                </el-table-column>
                <el-table-column label="Actions" min-width="150">
                    <template #default="scope">
                        <div class="action-buttons">
                            <el-button type="primary" size="small" @click="openEditDialog(scope.row)"
                                :disabled="!isActive(scope.row)">
                                <el-icon style="margin-right: 8px">
                                    <Edit />
                                </el-icon>
                                Edit
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog title="Edit Subscription" v-model="editDialogVisible" width="40%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <el-form ref="editForm" :model="editFormData" :rules="editRules" label-position="top"
                    class="centered-form">
                    <el-form-item label="Start Date" prop="startDate">
                        <el-date-picker v-model="editFormData.startDate" type="datetime"
                            placeholder="Select start date and time" format="DD/MM/YYYY, HH:mm"
                            value-format="YYYY-MM-DD HH:mm:ss" />
                    </el-form-item>
                    <el-form-item label="End Date" prop="endDate">
                        <el-date-picker v-model="editFormData.endDate" type="datetime"
                            placeholder="Select end date and time" format="DD/MM/YYYY, HH:mm"
                            value-format="YYYY-MM-DD HH:mm:ss" />
                    </el-form-item>
                    <el-form-item label="Available Sessions" prop="availableSessions">
                        <el-input-number v-model="editFormData.availableSessions" :min="0"
                            placeholder="Enter sessions" />
                    </el-form-item>
                    <el-form-item label="Status" prop="isActive">
                        <el-switch v-model="editFormData.isActive" :active-value="true" :inactive-value="false" />
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
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Edit, Check } from '@element-plus/icons-vue'
import { getSubscriptionListAPI, updateSubscriptionAPI } from '@/api/subscription'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

import AppHeader from '@/components/AppHeader.vue'
import HeaderTabs from '@/components/HeaderTabs.vue'

export default {
    name: 'SubscriptionsManagmentView',
    components: {
        Edit,
        Check,
        AppHeader,
        HeaderTabs,
    },
    data() {
        return {
            subscriptions: [],
            isLoading: true,
            editDialogVisible: false,
            searchQuery: '',
            editFormData: {
                id: null,
                startDate: null,
                endDate: null,
                availableSessions: 0,
                isActive: true,
            },
            editRules: {
                startDate: [
                    { required: true, message: 'Start date is required', trigger: 'blur' },
                ],
                endDate: [
                    { required: true, message: 'End date is required', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            const start = dayjs(this.editFormData.startDate, 'YYYY-MM-DD HH:mm:ss', true)
                            const end = dayjs(value, 'YYYY-MM-DD HH:mm:ss', true)

                            if (!end.isValid()) {
                                callback(new Error('Invalid end date format'))
                            } else if (end.isBefore(start)) {
                                callback(new Error('End date must be after start date'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur',
                    },
                ],
                availableSessions: [
                    { required: true, message: 'Sessions are required', trigger: 'blur' },
                    { type: 'number', min: 0, message: 'Sessions must be at least 0', trigger: 'blur' },
                ],
                isActive: [
                    { required: true, message: 'Status is required', trigger: 'change' },
                ],
            },
        }
    },
    computed: {
        filteredSubscriptions() {
            const q = this.searchQuery.trim().toLowerCase()
            if (!q) return this.subscriptions

            return this.subscriptions.filter(sub => {
                const idMatch = String(sub.id).includes(q)
                const nameMatch = `${sub.user.firstName} ${sub.user.lastName}`.toLowerCase().includes(q)
                const emailMatch = sub.user.email?.toLowerCase().includes(q)
                return idMatch || nameMatch || emailMatch
            })
        }
    },
    created() {
        this.fetchSubscriptions()
    },
    methods: {
        async fetchSubscriptions() {
            this.isLoading = true
            try {
                const data = await getSubscriptionListAPI()
                this.subscriptions = data.map(sub => ({
                    ...sub,
                    startDate: dayjs(sub.startDate).format('YYYY-MM-DD HH:mm:ss'),
                    endDate: dayjs(sub.endDate).format('YYYY-MM-DD HH:mm:ss'),
                }))
            } catch (error) {
                ElMessage.error('Failed to fetch subscriptions. Please try again.')
                console.error('Error fetching subscriptions:', error)
            } finally {
                this.isLoading = false
            }
        },
        formatDateTime(dateTime) {
            return dayjs(dateTime).format('DD/MM/YYYY, HH:mm')
        },
        isActive(subscription) {
            return subscription.isActive
        },
        openEditDialog(subscription) {
            this.editFormData = {
                id: subscription.id,
                startDate: dayjs(subscription.startDate).format('YYYY-MM-DD HH:mm:ss'),
                endDate: dayjs(subscription.endDate).format('YYYY-MM-DD HH:mm:ss'),
                availableSessions: subscription.availableSessions,
                isActive: subscription.isActive,
            }
            this.editDialogVisible = true
        },
        async saveSubscription() {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        await updateSubscriptionAPI(this.editFormData.id, {
                            startDate: dayjs(this.editFormData.startDate, 'YYYY-MM-DD HH:mm:ss').toISOString(),
                            endDate: dayjs(this.editFormData.endDate, 'YYYY-MM-DD HH:mm:ss').toISOString(),
                            availableSessions: this.editFormData.availableSessions,
                            isActive: this.editFormData.isActive,
                        })
                        this.fetchSubscriptions()
                        ElMessage.success('Subscription updated successfully')
                        this.editDialogVisible = false
                    } catch (error) {
                        ElMessage.error('Failed to update subscription. Please try again.')
                        console.error('Error updating subscription:', error)
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
            }).catch(() => { })
        },
    },
}
</script>

<style scoped>
.subscriptions-container {
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
    margin: 0 auto;
    max-width: 100%;
}

h2 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
}

.search-input {
    margin-bottom: 16px;
    width: 100%;
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

.el-button :deep(.el-icon) {
    margin-right: 8px;
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

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 80%;
}

@media (max-width: 768px) {
    .subscriptions-container {
        padding: 16px;
    }

    .content-wrapper {
        padding-top: 72px;
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

    .dialog-footer {
        width: 90%;
    }
}
</style>
