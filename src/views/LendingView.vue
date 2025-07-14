<template>
    <AppHeader />
    <div class="landing-page">
        <div class="gym-info">
            <h1>Welcome to FitnessPlus</h1>
            <p class="description">
                FitnessPlus offers state-of-the-art facilities, expert trainers, and a variety of classes to help you
                achieve your
                fitness goals. Enjoy unlimited gym access with our flexible subscription plans, tailored to your
                training needs.
                Join us today and start your fitness journey!
            </p>
            <el-button type="primary" size="large" @click="scrollToSubscriptions">Explore Plans</el-button>
        </div>

        <div class="stats-section">
            <h2>Our Achievements</h2>
            <el-row :gutter="20" class="stats-row">
                <el-col :span="6" v-for="(stat, index) in stats" :key="index" class="stat-col">
                    <el-statistic :title="stat.label" :value="stat.value" />
                </el-col>
            </el-row>
        </div>
        <div class="photo-info-section">
            <h2>About Our Facilities</h2>
            <el-row :gutter="20">
                <el-col :span="12">
                    <img src="/img/gym-equipment.jpg" alt="Gym Equipment" class="info-image">
                </el-col>
                <el-col :span="12">
                    <div class="info-text">
                        <p>
                            At FitnessPlus, we pride ourselves on our modern equipment and spacious workout areas. Our
                            facility
                            includes cardio machines, weightlifting stations, and a dedicated yoga studio. Our expert
                            trainers are
                            available to guide you through personalized workouts, ensuring you get the most out of every
                            session.
                        </p>
                        <p>
                            We also offer group classes such as Zumba, Spin, and HIIT, designed to keep you motivated
                            and engaged.
                            Visit us and experience a community that supports your fitness goals!
                        </p>
                    </div>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                    <img src="/img/group-classes.jpg" alt="Group Class" class="info-image">
                </el-col>
                <el-col :span="12">
                    <div class="info-text">
                        <p>
                            Join our vibrant group classes led by certified instructors. Whether you're a beginner or an
                            advanced
                            athlete, our classes cater to all levels. Experience the energy of our community and achieve
                            your fitness
                            milestones together!
                        </p>
                    </div>
                </el-col>
            </el-row>
        </div>

        <div class="subscription-section" id="subscriptions">
            <h2>Our Subscription Plans</h2>
            <p class="subtext">Unlimited gym access + personal/group training sessions. Choose your plan!</p>
            <el-carousel :interval="5000" type="card">
                <el-carousel-item v-for="subscription in subscriptions" :key="subscription.id">
                    <div class="carousel-item">
                        <h3>{{ subscription.name }}</h3>
                        <p class="price">${{ subscription.price }} / month</p>
                        <p class="details">Unlimited gym access</p>
                        <p class="details">{{ subscription.sessionLimit }} training sessions</p>
                        <el-button type="success" size="medium" @click="selectPlan(subscription)">
                            Select Plan
                        </el-button>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </div>

        <div class="footer">
            <p>© 2025 FitnessPlus. All rights reserved.</p>
        </div>
    </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';

import { getSubscriptionListAPI } from '@/api/subscription/template'

export default {
    name: 'LandingPage',
    components: {
        AppHeader
    },
    data() {
        return {
            isLoading: false,
            subscriptions: [],
            stats: [
                { value: '500+', label: 'Happy Members' },
                { value: '10+', label: 'Expert Trainers' },
                { value: '5', label: 'Years in Business' },
                { value: '20+', label: 'Group Classes' },
            ],
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
                const data = await getSubscriptionListAPI()
                this.subscriptions = data ? data : []
            } catch (err) {
                void err
            } finally {
                this.isLoading = false
            }
        },
        scrollToSubscriptions() {
            document.getElementById('subscriptions').scrollIntoView({ behavior: 'smooth' })
        },
        selectPlan(subscription) {
            this.$router.push({ name: 'PaymentView', params: { subscriptionId: subscription.id } })
        },
    },
}
</script>

<style scoped>
.landing-page {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 20px;
}

.gym-info {
    padding: 40px 20px;
    border-radius: 10px;
    margin-top: 60px;
    margin-bottom: 40px;
}

.gym-info h1 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 20px;
}

.description {
    font-size: 1.2em;
    color: #666;
    max-width: 800px;
    margin: 0 auto 30px;
}

.stats-section {
    padding: 40px 20px;
    margin-bottom: 40px;
}

.stats-section h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 20px;
}

.stats-row {
    justify-content: center;
}

.stat-col .el-statistic {
    padding: 20px;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-col .el-statistic__number {
    font-size: 1.8em;
    color: #27ae60;
}

/* ======= PHOTO INFO SECTION ======= */

.photo-info-section {
    padding: 60px 20px;
    margin-bottom: 60px;
    background-color: #f9f9f9;
}

.photo-info-section h2 {
    font-size: 2.2em;
    color: #2c3e50;
    margin-bottom: 30px;
}

.info-image {
    width: 100%;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.5s ease;
}

.info-image:hover {
    transform: scale(1.02);
}

.info-text {
    padding: 10px 20px;
    text-align: left;
    font-size: 1.1em;
    color: #444;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.info-text p {
    margin-bottom: 18px;
    line-height: 1.6;
}

.photo-info-section .el-row:nth-child(2n + 1) {
    margin-bottom: 30px;
}

.photo-info-section .el-row:nth-child(2n) {
    flex-direction: row-reverse;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin-top: 30px;
}

/* ======= FADE-IN ANIMATION ======= */

.fade-in {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

/* ======= SUBSCRIPTION SECTION ======= */

.subscription-section {
    background-color: #f9f9f9;
    padding: 40px 20px;
}

.subscription-section h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 10px;
}

.subtext {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 20px;
}

.carousel-item {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.carousel-item:hover {
    transform: translateY(-5px);
}

.price {
    font-size: 1.5em;
    color: #27ae60;
    margin: 10px 0;
}

.details {
    font-size: 1.1em;
    color: #34495e;
    margin-bottom: 10px;
}

/* ======= FOOTER ======= */

.footer {
    margin-top: 40px;
    padding: 20px;
    background-color: #2c3e50;
    color: #fff;
    font-size: 0.9em;
}

/* ======= BUTTON EFFECTS ======= */

.el-button {
    transition: all 0.3s ease;
}

.el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* ======= RESPONSIVE ======= */

@media (max-width: 768px) {
    .el-col {
        width: 100% !important;
    }

    .info-text {
        text-align: center;
        padding: 20px 10px;
    }

    .photo-info-section .el-row:nth-child(2n) {
        flex-direction: column !important;
    }

    .carousel-item {
        padding: 20px;
    }
}
</style>