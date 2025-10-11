import FinancesView from '@/components/HouseholdView/FinancesView.vue';
import CheckList from "@/components/HouseholdView/CheckList.vue";
import ChecklistOverview from "@/components/HouseholdView/ChecklistOverview.vue";
import HouseholdInfo from '@/components/HouseholdView/HouseholdInfo.vue';
import StatisticsView from '@/components/HouseholdView/StatisticsView.vue';
import TaskList from '@/components/HouseholdView/TaskList.vue';
import Dashboard from '@/views/DashBoard.vue';
import HouseholdView from '@/views/HouseholdView.vue';
import InviteView from '@/views/InviteView.vue';
import Login from '@/views/LoginPage.vue';
import SettingsView from '@/views/SettingsView.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

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
                path: 'finances',
                component: FinancesView,
                name: 'finances',
            },
            {
                path: 'statistics',
                component: StatisticsView,
                name: 'statistics',
            },
            {
                path: 'checklists',
                component: ChecklistOverview,
                name: 'checklists',
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
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
