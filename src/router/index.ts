import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: 'platforms/',
          name: 'platforms',
          component: () => import('@/views/PlatformConfigView.vue'),
          children: [
            {
              path: ':name',
              name: 'platforms-config',
              component: () => import('@/views/PlatformConfigView.vue'),
              props: (route) => ({ title: route.params.name + ' 配置', path: route.params.name }),
            }
          ]
        },
        {
          path: 'accounts/',
          name: 'accounts',
          component: () => import('@/views/AccountConfigView.vue'),
          children: [
            {
              path: ':name',
              name: 'accounts-config',
              component: () => import('@/components/ConfigurationList.vue'),
              props: (route) => ({ title: route.params.name + ' 配置', path: route.params.name }),
            }
          ]
        },
        {
          path: 'utilites/',
          name: 'utilites',
          component: () => import('@/views/UtilitiesConfigView.vue'),
          children: [
            {
              path: ':name',
              name: 'utilites-config',
              component: () => import('@/components/ConfigurationList.vue'),
              props: (route) => ({ title: route.params.name + ' 配置', path: route.params.name }),
            }
          ]
        },
        {
          path: 'presets/',
          name: 'presets',
          component: () => import('@/views/AboutView.vue'),
          children: [
            {
              path: ':name',
              name: 'presets-config',
              component: () => import('@/components/ConfigurationList.vue'),
              props: (route) => ({ title: route.params.name + ' 配置', path: route.params.name }),
            }
          ]
        },
        {
          path: 'dashboard/',
          name: 'dashboard',
          component: () => import('@/views/AboutView.vue')
        }

      ]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
