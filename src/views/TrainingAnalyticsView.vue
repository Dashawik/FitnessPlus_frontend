<template>
    <AppHeader />
    <HeaderTabs />
    <div class="training-analytics-container">
        <h1>Training Analytics</h1>
        <el-tabs v-model="activeTab" class="tabs" @tab-change="loadChartData">
            <el-tab-pane label="Popular Training Types" name="popular">
                <div ref="popularChart" style="width: 100%; height: 400px;"></div>
            </el-tab-pane>
            <el-tab-pane label="Training Activity by Day" name="activity">
                <div ref="activityChart" style="width: 100%; height: 400px;"></div>
            </el-tab-pane>
            <el-tab-pane label="Bookings per Trainer" name="bookings">
                <div ref="bookingsChart" style="width: 100%; height: 400px;"></div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Plotly from 'plotly.js-dist';
import { ElTabs, ElTabPane } from 'element-plus';
import { getPopularTrainingTypes, getTrainingActivityByDay, getBookingsPerTrainer } from '@/api/report';

import AppHeader from '@/components/AppHeader.vue';
import HeaderTabs from '@/components/HeaderTabs.vue';

export default {
    name: 'TrainingAnalyticsPage',
    components: {
        ElTabs,
        ElTabPane,
        AppHeader,
        HeaderTabs,
    },
    setup() {
        const activeTab = ref('popular');
        const popularChart = ref(null);
        const activityChart = ref(null);
        const bookingsChart = ref(null);
        const chartData = ref({
            popular: [],
            activity: [],
            bookings: [],
        });

        const loadChartData = async (tab) => {
            if (!chartData.value[tab].length) {
                try {
                    let response;
                    switch (tab) {
                        case 'popular':
                            response = await getPopularTrainingTypes();
                            chartData.value.popular = response;
                            break;
                        case 'activity':
                            response = await getTrainingActivityByDay();
                            chartData.value.activity = response;
                            break;
                        case 'bookings':
                            response = await getBookingsPerTrainer();
                            chartData.value.bookings = response;
                            break;
                    }
                    renderChart(tab);
                } catch (error) {
                    console.error(`Error loading ${tab} data:`, error);
                }
            } else {
                renderChart(tab);
            }
        };

        const renderChart = (tab) => {
            let data, layout;
            switch (tab) {
                case 'popular':
                    data = [{
                        x: chartData.value.popular.map(item => item.training_type),
                        y: chartData.value.popular.map(item => item.percentage),
                        type: 'bar',
                        marker: { color: 'rgb(158, 202, 225)' },
                    }];
                    layout = {
                        title: 'Percentage of Bookings by Training Type',
                        xaxis: { title: 'Training Type' },
                        yaxis: { title: 'Percentage (%)', range: [0, 100] },
                        bargap: 0.2,
                    };
                    Plotly.newPlot(popularChart.value, data, layout);
                    break;
                case 'activity':
                    data = [{
                        x: chartData.value.activity.map(item => item.day_of_week),
                        y: chartData.value.activity.map(item => item.training_count),
                        type: 'bar',
                        marker: { color: 'rgb(94, 158, 217)' },
                    }];
                    layout = {
                        title: 'Training Activity by Day of Week',
                        xaxis: { title: 'Day of Week' },
                        yaxis: { title: 'Number of Trainings' },
                        bargap: 0.2,
                    };
                    Plotly.newPlot(activityChart.value, data, layout);
                    break;
                case 'bookings':
                    data = [{
                        x: chartData.value.bookings.map(item => `${item.firstName} ${item.lastName}`),
                        y: chartData.value.bookings.map(item => item.booking_count),
                        type: 'bar',
                        marker: { color: 'rgb(219, 112, 147)' },
                    }];
                    layout = {
                        title: 'Bookings per Trainer',
                        xaxis: { title: 'Trainer Name' },
                        yaxis: { title: 'Number of Bookings' },
                        bargap: 0.2,
                    };
                    Plotly.newPlot(bookingsChart.value, data, layout);
                    break;
            }
        };

        onMounted(() => {
            loadChartData(activeTab.value);
        });

        watch(activeTab, (newTab) => {
            loadChartData(newTab);
        });

        return { activeTab, popularChart, activityChart, bookingsChart };
    },
};
</script>

<style scoped>
.training-analytics-container {
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}

.tabs :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
}

.tabs :deep(.el-tabs__nav-wrap::after) {
    background-color: #e4e7ed;
}

.tabs :deep(.el-tabs__active-bar) {
    background-color: #409eff;
}
</style>