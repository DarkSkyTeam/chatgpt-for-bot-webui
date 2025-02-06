import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/im'
        },
        {
          path: '/im',
          name: 'im',
          component: () => import('@/views/im/IMView.vue')
        },
        {
          path: '/llm',
          name: 'llm',
          component: () => import('@/views/llm/LLMView.vue')
        },
        {
          path: '/workflow',
          name: 'workflow',
          component: () => import('@/views/workflow/WorkflowView.vue')
        },
        {
          path: '/plugins',
          name: 'plugins',
          component: () => import('@/views/plugins/PluginList.vue')
        },
        {
          path: '/plugins/market',
          name: 'plugin-market',
          component: () => import('@/views/plugins/PluginMarket.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'login' && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
