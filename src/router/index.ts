import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from '@/views/LoginPage.vue';
import Dashboard from '@/views/DashBoard.vue';
import LoadingScreen from '@/views/LoadingScreen.vue';
import AppRouterOutlet from '@/views/AppRouterOutlet.vue';
import InviteView from '@/views/InviteView.vue';
import HouseholdView from '@/views/HouseholdView.vue';
import TaskList from '@/components/HouseholdView/TaskList.vue';
import CheckList from '@/components/HouseholdView/CheckList.vue';
import HouseholdInfo from '@/components/HouseholdView/HouseholdInfo.vue';

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
        redirect: route => `/app/household/${route.params.id}/tasks`,
        props: route => ({ id: parseInt(route.params.id as string) }),
        children: [
          {
            path: '/app/household/:id/tasks',
            props: route => ({ id: parseInt(route.params.id as string) }),
            component: TaskList,
          },
          {
            path: '/app/household/:id/checklist',
            props: route => ({ id: parseInt(route.params.id as string) }),
            component: CheckList,
          },
          {
            path: '/app/household/:id/info',
            props: route => ({ id: parseInt(route.params.id as string) }),
            component: HouseholdInfo,
          },
        ],
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
