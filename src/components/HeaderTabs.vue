<template>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="header-tabs">
        <el-tab-pane label="Training сalendar" name="/training" />
        <el-tab-pane label="User management" name="/user/management" />
        <el-tab-pane label="Training types management" name="/training/types/management" />
        <el-tab-pane label="Subscription template management" name="/subscription/template" />
    </el-tabs>

</template>

<script>
export default {
    name: 'HeaderTabs',
    data() {
        return {
            activeTab: this.$route.path
        }
    },
    watch: {
        '$route.path'(newPath) {
            this.activeTab = newPath
        }
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
}
</style>