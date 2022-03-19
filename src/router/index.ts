import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from '@/views/LoginPage.vue';
import Dashboard from '@/views/DashBoard.vue';
import LoadingScreen from '@/views/LoadingScreen.vue';
import AppRouterOutlet from '@/views/AppRouterOutlet.vue';
import InviteView from '@/views/InviteView.vue';

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
    path: '/app',
    component: AppRouterOutlet,
    redirect: '/app/dashboard',
    children: [
      {
        path: '/app/dashboard',
        component: Dashboard,
      },
      {
        path: '/app/invites',
        component: InviteView,
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
