import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Login from '@/views/LoginPage.vue';
import Dashboard from '@/views/DashBoard.vue';
import InviteView from '@/views/InviteView.vue';
import SettingsView from '@/views/SettingsView.vue';
import HouseholdView from '@/views/HouseholdView.vue';
import TaskList from '@/components/HouseholdView/TaskList.vue';
import ActivityView from '@/components/HouseholdView/ActivityView.vue';
import StatisticsView from '@/components/HouseholdView/StatisticsView.vue';
import CheckList from '@/components/HouseholdView/CheckList.vue';
import HouseholdInfo from '@/components/HouseholdView/HouseholdInfo.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: Login,
    name: 'login',
  },
  {
    path: '/invites',
    component: InviteView,
    name: 'invite-view',
  },
  {
    path: '/settings',
    component: SettingsView,
    name: 'settings',
  },
  {
    path: '/',
    component: Dashboard,
    name: 'dashboard',
  },
  {
    path: '/household',
    component: HouseholdView,
    redirect: '/household/tasks',
    name: 'household-view',
    children: [
      {
        path: '',
        redirect: '/household/tasks',
        name: 'redirect-to-tasks',
      },
      {
        path: 'tasks',
        component: TaskList,
        name: 'tasks',
      },
      {
        path: 'activity',
        component: ActivityView,
        name: 'activity',
      },
      {
        path: 'statistics',
        component: StatisticsView,
        name: 'statistics',
      },
      {
        path: 'checklist',
        component: CheckList,
        name: 'checklist',
      },
      {
        path: 'info',
        component: HouseholdInfo,
        name: 'info',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
