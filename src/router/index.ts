import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
{
          path: 'platforms/',
          name: 'platforms',
          component: HomeView,
          children: [
            {
              path: ':name',
              name: 'platforms-config',
              component: () => import('@/components/ConfigurationList.vue'),
              props: (route) => ({ title: route.params.name + ' 配置', path: route.params.name }),
            }
          ]
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
