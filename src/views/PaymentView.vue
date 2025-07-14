<template>
    <div class="payment-page">
        <el-page-header @back="$router.back()" content="Payment Details" class="page-header" />

        <div v-if="isLoading" class="loading">
            <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="subscription">
            <el-card shadow="hover" class="payment-card">
                <el-row :gutter="20" class="card-content">
                    <el-col :span="24">
                        <h2>{{ subscription.name }}</h2>
                        <el-divider />
                    </el-col>

                    <el-col :span="24">
                        <el-descriptions border column="1" size="default">
                            <el-descriptions-item label="Price">
                                <el-tag type="success" size="large">${{ subscription.price }} / month</el-tag>
                            </el-descriptions-item>

                            <el-descriptions-item label="Access">
                                Unlimited gym access
                            </el-descriptions-item>

                            <el-descriptions-item label="Session Limit">
                                {{ subscription.sessionLimit }} training sessions
                            </el-descriptions-item>
                        </el-descriptions>
                    </el-col>

                    <el-col :span="24" class="button-col">
                        <el-button type="success" size="large" @click="processPayment" :loading="isProcessing" round>
                            {{ isProcessing ? 'Processing...' : 'Pay Now' }}
                        </el-button>
                    </el-col>
                </el-row>
            </el-card>
        </div>

        <div v-else class="error-message">
            <el-empty description="Subscription not found or error occurred." />
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { getSubscriptionAPI } from '@/api/subscription/template'
import { createPaymentAPI } from '@/api/payment'

export default {
    name: 'PaymentView',
    props: {
        subscriptionId: {
            type: [Number, String],
            required: true,
        },
    },
    data() {
        return {
            isLoading: false,
            isProcessing: false,
            subscription: null,
        }
    },
    created() {
        this.fetchSubscription()
    },
    methods: {
        formatDate(date) {
            return date
                ? new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                : 'N/A'
        },
        async fetchSubscription() {
            this.isLoading = true
            try {
                const data = await getSubscriptionAPI(this.subscriptionId)
                this.subscription = data || null
            } catch ({ response }) {
                if (response?.data?.details) {
                    response.data.details.forEach((detail) => {
                        ElMessage.error(detail)
                    })
                } else {
                    ElMessage.error('Failed to load subscription details.')
                }
            } finally {
                this.isLoading = false
            }
        },
        async processPayment() {
            this.isProcessing = true
            try {
                await createPaymentAPI(this.subscriptionId)
                ElMessage.success(`Payment for ${this.subscription.name} successful!`)
                this.$router.push('/home')
            } catch ({ response }) {
                if (response?.data?.details) {
                    response.data.details.forEach((detail) => {
                        ElMessage.error(detail)
                    })
                } else {
                    ElMessage.error('Payment failed. Please try again.')
                }
            } finally {
                this.isProcessing = false
            }
        },
    },
}
</script>

<style scoped>
.payment-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 40px 20px;
    max-width: 900px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 30px;
}

.payment-card {
    border-radius: 12px;
    padding: 20px;
}

.card-content {
    text-align: left;
}

h2 {
    font-size: 1.8em;
    color: #2c3e50;
    margin: 0;
}

.button-col {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.error-message {
    margin-top: 40px;
}
</style>
