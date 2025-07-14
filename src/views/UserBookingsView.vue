<template>
    <AppHeader />
    <HeaderTabs />
    <div class="bookings-container">
        <div class="content-wrapper">
            <h2>My Bookings</h2>
            <div v-if="isLoading" class="skeleton-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
            <el-table v-else :data="bookings" style="width: 100%" border class="centered-table"
                :cell-style="{ textAlign: 'center', padding: '12px' }"
                :header-cell-style="{ textAlign: 'center', background: '#f5f7fa', fontWeight: '500', padding: '12px' }">
                <el-table-column prop="id" label="Booking ID" min-width="100"></el-table-column>
                <el-table-column prop="training.type.name" label="Type" min-width="150"></el-table-column>
                <el-table-column label="Trainer" min-width="200">
                    <template #default="scope">
                        {{ scope.row.training.trainer.firstName }} {{ scope.row.training.trainer.lastName }}
                    </template>
                </el-table-column>
                <el-table-column label="Time" min-width="250">
                    <template #default="scope">
                        <span :class="{ 'warning-time': isWithinTwoHoursOfStart(scope.row.training.startTime) }">
                            {{ formatDateTime(scope.row.training.startTime) }} - {{
                                formatDateTime(scope.row.training.endTime) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="Status" min-width="150"></el-table-column>
                <el-table-column label="Actions" min-width="200">
                    <template #default="scope">
                        <div class="action-buttons">
                            <el-button type="danger" size="small" @click="openCancelDialog(scope.row)"
                                :disabled="scope.row.status !== 'ACTIVE'">
                                <el-icon style="margin-right: 8px">
                                    <Delete />
                                </el-icon>
                                Cancel
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog v-model="cancelDialogVisible" title="Confirm Cancellation" width="30%"
                :before-close="handleCloseDialog" class="centered-dialog">
                <span>Are you sure you want to cancel this booking?</span>
                <p v-if="isWithinTwoHours" class="warning">
                    <strong>Important:</strong> Cancellation is within 2 hours of the training start time. The session
                    will
                    <u>not</u> be refunded to your subscription.
                </p>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="cancelDialogVisible = false">Cancel</el-button>
                        <el-button type="danger" @click="confirmCancel">Confirm</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

import { getBookingListAPI, cancelBookingAPI } from '@/api/booking'


import AppHeader from '@/components/AppHeader.vue'
import HeaderTabs from '@/components/HeaderTabs.vue'

export default {
    name: 'UserBookingsView',
    components: {
        Delete,
        AppHeader,
        HeaderTabs,
    },
    data() {
        return {
            bookings: [],
            isLoading: true,
            cancelDialogVisible: false,
            selectedBooking: null,
        }
    },
    created() {
        this.fetchBookings()
    },
    computed: {
        isWithinTwoHours() {
            if (!this.selectedBooking) return false
            const startTime = new Date(this.selectedBooking.training.startTime)
            const now = new Date()
            const twoHoursInMs = 2 * 60 * 60 * 1000
            return startTime - now < twoHoursInMs
        },
    },
    methods: {
        async fetchBookings() {
            this.isLoading = true
            try {
                const data = await getBookingListAPI()
                this.bookings = data
            } catch (error) {
                ElMessage.error('Failed to fetch bookings. Please try again.')
                console.error('Error fetching bookings:', error)
            } finally {
                this.isLoading = false
            }
        },
        formatDateTime(dateTime) {
            return new Date(dateTime).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
        },
        isWithinTwoHoursOfStart(startTime) {
            const trainingStart = new Date(startTime)
            const now = new Date()
            const twoHoursInMs = 2 * 60 * 60 * 1000
            return trainingStart - now < twoHoursInMs
        },
        openCancelDialog(booking) {
            this.selectedBooking = booking
            this.cancelDialogVisible = true
        },
        async confirmCancel() {
            this.isLoading = true
            try {
                await cancelBookingAPI(this.selectedBooking.id)
                this.fetchBookings()
                ElMessage.success('Booking cancelled successfully')
                if (this.isWithinTwoHours) {
                    ElMessage.warning('Session not refunded to subscription due to 2-hour policy.')
                }
            } catch (error) {
                ElMessage.error('Failed to cancel booking. Please try again.')
                console.error('Error cancelling booking:', error)
            } finally {
                this.isLoading = false
                this.cancelDialogVisible = false
                this.selectedBooking = null
            }
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
.bookings-container {
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
    max-width: 1200px;
    padding-top: 0;
}

h2 {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    text-align: center;
}

.refund-policy {
    font-size: 14px;
    color: #606266;
    margin-bottom: 16px;
    text-align: center;
    background-color: #fff3f3;
    padding: 8px;
    border-radius: 4px;
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

.warning-time {
    color: #f56c6c;
    font-weight: bold;
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

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 80%;
}

.warning {
    color: #f56c6c;
    font-weight: bold;
    margin-top: 10px;
}

@media (max-width: 768px) {
    .bookings-container {
        padding: 16px;
    }

    .content-wrapper {
        padding-top: 0;
    }

    h2 {
        font-size: 20px;
    }

    .refund-policy {
        font-size: 12px;
    }

    .centered-table {
        font-size: 14px;
    }

    .el-button {
        padding: 6px 8px;
        font-size: 12px;
    }

    .dialog-footer {
        width: 90%;
    }
}
</style>