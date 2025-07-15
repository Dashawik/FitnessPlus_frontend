<template>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="header-tabs">
        <el-tab-pane label="Training сalendar" name="/home" />

        <el-tab-pane v-if="userRole === 'ADMIN'" label="User management" name="/user/management" />

        <el-tab-pane v-if="userRole === 'ADMIN'" label="Subscriptions managment" name="/subscriptions/managment" />

        <el-tab-pane v-if="userRole === 'ADMIN'" label="Subscription template management"
            name="/subscription/template" />

        <el-tab-pane v-if="userRole === 'ADMIN'" label="Training types management" name="/training/types/management" />

        <el-tab-pane v-if="userRole === 'USER'" label="My subscription" name="/user/subscriptions" />
        <el-tab-pane v-if="userRole === 'USER'" label="My booking" name="/user/bookings" />
    </el-tabs>
</template>

<script>
import Cookies from 'js-cookie'

export default {
    name: 'HeaderTabs',
    data() {
        return {
            activeTab: this.$route.path,
            userRole: null
        }
    },
    watch: {
        '$route.path'(newPath) {
            this.activeTab = newPath
        }
    },
    async created() {
        const user = Cookies.get('user')
        const data = JSON.parse(user || '{}')
        this.userRole = data.role
    },
    methods: {
        handleTabClick(tab) {
            this.$router.push(tab.paneName)
        }
    }
}
</script>

<style scoped>
.header-tabs {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 82px;
}
</style>
