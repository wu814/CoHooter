import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import GamePage from '@/pages/GamePage.vue'
import ScoreboardPage from '@/pages/ScoreboardPage.vue'
import AdminPage from '@/pages/AdminPage.vue'

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
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
