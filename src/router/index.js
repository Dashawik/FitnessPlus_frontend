import { createRouter, createWebHistory } from 'vue-router'

import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LendingView',
      component: () => import('../views/LendingView.vue'),
      meta: { title: "FitnessPlus | Welcome" },
    },
    {
      path: '/login',
      name: 'LoginView',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { title: "Login | FitnessPlus" },
    },
    {
      path: '/register',
      name: 'RegisterView',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { title: "Register | FitnessPlus" },
    },
    {
      path: '/confirmation',
      name: 'MailConfirmationView',
      component: () => import('../views/auth/MailConfirmationView.vue'),
      meta: { title: "Email confirmation | FitnessPlus" },
    },
    {
      path: '/verify/:token',
      name: 'EmailVerificationView',
      component: () => import('../views/auth/EmailVerificationView.vue'),
      meta: { title: "Email verification | FitnessPlus" },
    },
    {
      path: '/forgotPassword',
      name: 'ForgotPasswordView',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { title: "Forgot password | FitnessPlus" },
    },
    {
      path: '/resetPassword/:token',
      name: 'ResetPasswordView',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { title: "Reset pssword | FitnessPlus" },
    },
    {
      path: '/user/management',
      name: 'UserManagmentView',
      component: () => import('../views/UserManagmentView.vue'),
      meta: { title: "User managment | FitnessPlus", requiresAuth: true, roles: ["ADMIN"] },
    },
    {
      path: '/training/types/management',
      name: 'TrainingTypesManagementView',
      component: () => import('../views/TrainingTypesManagement.vue'),
      meta: { title: "Training types | FitnessPlus", requiresAuth: true, roles: ["ADMIN"] },
    },
    {
      path: '/home',
      name: 'TrainingCalendarView',
      component: () => import('../views/TrainingCalendar.vue'),
      meta: { title: "Training calendar | FitnessPlus", requiresAuth: true, roles: ["USER", "TRAINER", "ADMIN"] },
    },
    {
      path: '/subscription/template',
      name: 'SubscriptionTemplateView',
      component: () => import('../views/SubscriptionTemplate.vue'),
      meta: { title: "Subscription template | FitnessPlus", requiresAuth: true, roles: ["ADMIN"] },
    },
    {
      path: '/payment/:subscriptionId',
      name: 'PaymentView',
      component: () => import('../views/PaymentView.vue'),
      props: true,
      meta: { title: "Payment | FitnessPlus", requiresAuth: true, roles: ["USER"] },
    },
    {
      path: '/user/subscriptions',
      name: 'UserSubscriptions',
      component: () => import('../views/UserSubscriptions.vue'),
      meta: { title: 'My subscription | FitnessPlus', requiresAuth: true, roles: ["USER"] },
    },
    {
      path: '/user/bookings',
      name: 'UserBookingsView',
      component: () => import('../views/UserBookingsView.vue'),
      meta: { title: 'My bookings | FitnessPlus', requiresAuth: true, roles: ["USER"] },
    },
    {
      path: '/subscriptions/managment',
      name: 'SubscriptionsManagmentView',
      component: () => import('../views/SubscriptionsManagmentView.vue'),
      meta: { title: 'Subscriptions managment | FitnessPlus', requiresAuth: true, roles: ["ADMIN"] },
    },
    {
      path: '/report',
      name: 'TrainingAnalyticsView.vue',
      component: () => import('../views/TrainingAnalyticsView.vue'),
      meta: { title: 'My report | FitnessPlus', requiresAuth: true, roles: ["ADMIN", "TRAINER"] },
    },

    {
      path: '/profile',
      name: 'ProfileView',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'My profole | FitnessPlus', requiresAuth: true, roles: ["USER", "TRAINER", "ADMIN"] },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      meta: { title: '404 | FitnessPlus' },
    },

  ],
})

router.afterEach((to) => {
  document.title = to.meta.title || 'FitnessPlus'
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = Cookies.get('refreshToken') !== undefined;
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
  const userRole = user ? user.role : null;

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next("/login");
    }

    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      return next("/");
    }
  }

  next();
});

export default router
