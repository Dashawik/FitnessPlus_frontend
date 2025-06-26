import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LendingView',
      component: () => import('../views/LendingView.vue'),
    },
    {
      path: '/login',
      name: 'LoginView',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'RegisterView',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/confirmation',
      name: 'MailConfirmationView',
      component: () => import('../views/MailConfirmationView.vue'),
    },
    {
      path: '/verify/:token',
      name: 'EmailVerificationView',
      component: () => import('../views/EmailVerificationView.vue'),
    },
    {
      path: '/forgotPassword',
      name: 'ForgotPasswordView',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/resetPassword/:token',
      name: 'ResetPasswordView',
      component: () => import('../views/ResetPasswordView.vue'),
    },
  ],
})

export default router
