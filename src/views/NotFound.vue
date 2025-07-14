<template>
    <div class="not-found-page">
        <el-result icon="error" title="404" sub-title="Oops! The page you are looking for does not exist.">
            <template #extra>
                <el-button type="primary" @click="$router.push('/')">
                    Back to Home
                </el-button>
            </template>
        </el-result>
    </div>
</template>

<script>
export default {
    name: 'NotFound',
}
</script>

<style scoped>
.not-found-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-top: 92px;
}

:deep(.el-result) {
    text-align: center;
}

:deep(.el-result__icon) {
    font-size: 100px;
    color: #f56c6c;
}

:deep(.el-result__title) {
    font-size: 32px;
    color: #1f2d3d;
    margin: 20px 0;
}

:deep(.el-result__subtitle) {
    font-size: 16px;
    color: #606266;
}

:deep(.el-button) {
    padding: 12px 24px;
    font-size: 16px;
}
</style>