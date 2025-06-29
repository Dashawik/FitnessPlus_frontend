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
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'RegisterView',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/confirmation',
      name: 'MailConfirmationView',
      component: () => import('../views/auth/MailConfirmationView.vue'),
    },
    {
      path: '/verify/:token',
      name: 'EmailVerificationView',
      component: () => import('../views/auth/EmailVerificationView.vue'),
    },
    {
      path: '/forgotPassword',
      name: 'ForgotPasswordView',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
    },
    {
      path: '/resetPassword/:token',
      name: 'ResetPasswordView',
      component: () => import('../views/auth/ResetPasswordView.vue'),
    },
  ],
})

export default router
