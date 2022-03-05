import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from '@/views/LoginPage.vue';
import Dashboard from '@/views/DashBoard.vue';
import LoadingScreen from '@/views/LoadingScreen.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: LoadingScreen
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/dashboard',
    component: Dashboard,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
