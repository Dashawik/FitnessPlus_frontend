<template>
    <AppHeader />
    <HeaderTabs />
    <div class="user-subscriptions">
        <h2>My Subscriptions</h2>
        <el-button type="primary" @click="showBuyDialog = true" style="margin-bottom: 20px">
            Buy New Subscription
        </el-button>

        <el-row :gutter="20" v-if="subscriptions.length">
            <el-col v-for="subscription in subscriptions" :key="subscription.id" :xs="24" :sm="12" :md="8">
                <el-card class="subscription-card" shadow="hover">
                    <div class="card-header">
                        <h3>{{ subscription.template?.name || 'Unknown Plan' }}</h3>
                        <el-tag :type="subscription.isActive ? 'success' : 'danger'" effect="dark">
                            {{ subscription.isActive ? 'Active' : 'Inactive' }}
                        </el-tag>
                    </div>
                    <div class="card-content">
                        <p><strong>Subscription ID:</strong> #{{ subscription.id }}</p>
                        <p><strong>Start:</strong> {{ formatDate(subscription.startDate) }}</p>
                        <p><strong>End:</strong> {{ formatDate(subscription.endDate) }}</p>
                        <p><strong>Sessions left:</strong> {{ subscription.availableSessions ?? 'N/A' }}</p>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-empty v-else description="No subscriptions found." />

        <!-- Buy Dialog -->
        <el-dialog title="Available Subscriptions" v-model="showBuyDialog" width="600px"
            :before-close="handleDialogClose">
            <el-row :gutter="20">
                <el-col v-for="plan in availablePlans" :key="plan.id" :xs="24" :sm="12">
                    <el-card class="plan-card" shadow="hover">
                        <h3>{{ plan.name }}</h3>
                        <p class="price">${{ plan.price }} / month</p>
                        <p>{{ plan.description || 'No description available.' }}</p>
                        <el-button type="success" size="small" @click="buyPlan(plan.id)" style="margin-top: 10px">
                            Buy
                        </el-button>
                    </el-card>
                </el-col>
            </el-row>
            <template #footer>
                <el-button @click="showBuyDialog = false">Close</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { getSubscriptionListAPI } from '@/api/subscription'
import { getSubscriptionListAPI as getSubscriptionListTemplateAPI } from '@/api/subscription/template'

import AppHeader from '@/components/AppHeader.vue'
import HeaderTabs from '@/components/HeaderTabs.vue'

export default {
    name: 'MySubscriptions',
    components: {
        AppHeader,
        HeaderTabs
    },
    data() {
        return {
            subscriptions: [],
            availablePlans: [],
            showBuyDialog: false,
            isLoadingPlans: false,
        }
    },
    async created() {
        await this.fetchSubscriptions()
    },
    methods: {
        formatDate(date) {
            return date ? new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }) : 'N/A'
        },
        async fetchSubscriptions() {
            try {
                const data = await getSubscriptionListAPI()
                this.subscriptions = Array.isArray(data) ? data : []
            } catch (error) {
                ElMessage.error('Failed to fetch subscriptions. Please try again.')
                console.error('Error fetching subscriptions:', error)
            }
        },
        async loadAvailablePlans() {
            this.isLoadingPlans = true
            try {
                const data = await getSubscriptionListTemplateAPI()
                this.availablePlans = Array.isArray(data) ? data : []
            } catch (error) {
                ElMessage.error('Failed to load available plans.')
                console.error('Error loading available plans:', error)
            } finally {
                this.isLoadingPlans = false
            }
        },
        buyPlan(planId) {
            this.showBuyDialog = false
            this.$router.push({ path: `/payment/${planId}` })
        },
        handleDialogClose(done) {
            this.showBuyDialog = false
            done()
        },
    },
    watch: {
        showBuyDialog(newVal) {
            if (newVal && this.availablePlans.length === 0) {
                this.loadAvailablePlans()
            }
        },
    },
}
</script>

<style scoped>
.user-subscriptions {
    padding: 40px 20px;
    font-family: Arial, sans-serif;
    text-align: center;
}

.user-subscriptions h2 {
    font-size: 2em;
    color: #2c3e50;
    margin-bottom: 20px;
}

.subscription-card {
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.3s;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.subscription-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.card-header h3 {
    font-size: 1.4em;
    color: #34495e;
    margin: 0;
}

.card-content p {
    font-size: 1.1em;
    color: #555;
    margin: 6px 0;
}

.plan-card {
    border-radius: 12px;
    padding: 15px;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: left;
}

.plan-card h3 {
    margin-bottom: 8px;
    color: #2c3e50;
}

.price {
    font-weight: 700;
    font-size: 1.2em;
    color: #27ae60;
    margin-bottom: 10px;
}
</style>