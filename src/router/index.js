import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import GamePage from '@/pages/GamePage.vue'
import ScoreboardPage from '@/pages/ScoreboardPage.vue'
import AdminPage from '@/pages/AdminPage.vue'
import HostPage from '@/pages/HostPage.vue'
import { useSession } from '@/composables/useSession'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/game',
    name: 'Game',
    component: GamePage,
  },
  {
    path: '/scoreboard',
    name: 'Scoreboard',
    component: ScoreboardPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { educatorOnly: true },
  },
  {
    path: '/host',
    name: 'Host',
    component: HostPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (!to.meta?.educatorOnly) return true
  const { player } = useSession()
  if (player.value) {
    return { name: 'Home' }
  }
  return true
})

export default router
