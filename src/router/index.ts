import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import Login from '@/views/LoginPage.vue';
import Dashboard from '@/views/DashBoard.vue';
import LoadingScreen from '@/views/LoadingScreen.vue';
import AppRouterOutlet from '@/views/AppRouterOutlet.vue';
import InviteView from '@/views/InviteView.vue';
import HouseholdView from '@/views/HouseholdView.vue';
import store from '@/store';

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
      {
        path: '/app/household/:id',
        component: HouseholdView,
        props: route => ({ id: parseInt(route.params.id as string) })
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
