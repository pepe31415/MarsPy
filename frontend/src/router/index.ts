import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/victory',
      name: 'victory',
      component: () => import('@/views/VictoryView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const gameStore = useGameStore()
  if (to.meta.requiresAuth && !gameStore.player) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
