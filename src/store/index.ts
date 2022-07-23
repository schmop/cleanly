import { createStore, Store } from 'vuex';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';
import { Task } from '@/models/Task';
import { Todo } from '@/models/Todo';
import { TaskLog } from '@/models/TaskLog';

// declare your own store states
export interface State {
    loggedIn: boolean,
    households: Household[],
    user: null | User,
    invites: Invite[],
    pageTitle: null | string,
    taskLogs: Record<string, TaskLog[]>,
    viewedHousehold: null|number,
}

declare module '@vue/runtime-core' {
    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}


export const store = createStore<State>({
    state: () => ({
        loggedIn: false,
        households: [] as Household[],
        user: null as null | User,
        invites: [] as Invite[],
        pageTitle: null as null | string,
        taskLogs: {} as Record<number, TaskLog[]>,
        viewedHousehold: null,
    }),
    getters: {
        checklist: (state: State) => (householdId: number) => {
            return state.households.find((household: Household) => household.id === householdId)?.checklist;
        },
        household: (state: State) => (householdId: number): undefined|Household => {
            return state.households.find((household: Household) => household.id === householdId);
        }
    },
    mutations: {
        login(state: State) {
            state.loggedIn = true;
        },
        logout(state: State) {
            state.loggedIn = false;
        },
        user(state: State, user) {
            state.user = user;
        },
        pageTitle(state: State, title: string) {
            state.pageTitle = title;
        },
        viewHousehold(state: State, householdId: number) {
            state.viewedHousehold = householdId;
        },
        logs(state: State, data: {logs: TaskLog[], householdId: number}) {
            const {logs, householdId} = data;
            const household = state.households.find((household) => household.id === householdId);
            if (null == household) {
                throw new Error('Could not mutate logs, invalid household id given!');
            }

            state.taskLogs[householdId] = logs;
        },
        removeTask(state: State, taskId: string) {
            const household = state
                .households
                .find(
                    (h: Household) => h.tasks.some((t: Task) => t.id === taskId)
                );
            if (household != null) {
                household.tasks.splice(household.tasks.findIndex((t: Task) => t.id === taskId), 1);
            }
        },
        markTaskDone(state: State, data: { taskId: string, timestamp: number }) {
            const { taskId, timestamp } = data;
            const task = state
                .households
                .map((household: Household) => household.tasks)
                .flat()
                .find((task: Task) => task.id === taskId);

            if (task) {
                task.lastComplete = timestamp;
            }
        },
        updateChecklist(state: State, data: { household_id: number, checklist: Todo[] }) {
            const { household_id, checklist } = data;
            const household = state.households.find(household => household.id === household_id);
            if (household) {
                household.checklist = checklist;
            }
        },
        dashboard(state: State, data) {
            state.households = data.households;
            state.user = data.user;
            state.invites = data.invites;
        },
        removeInvite(state: State, inviteToRemove: Invite) {
            state.invites = state.invites.filter(invite => invite !== inviteToRemove);
        },
        joinHousehold(state: State, household: Household) {
            state.households.push(household);
        }
    }
});

export default store;