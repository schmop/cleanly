import { createStore, Store } from 'vuex';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';
import { Task } from '@/models/Task';

// declare your own store states
export interface State {
    households: Household[],
    user: null | User,
    invites: Invite[],
    pageTitle: null | string,
}

declare module '@vue/runtime-core' {
    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}


export const store = createStore<State>({
    state: () => ({
        households: [] as Household[],
        user: null as null | User,
        invites: [] as Invite[],
        pageTitle: null as null | string,
    }),
    mutations: {
        user(state: State, user) {
            state.user = user;
        },
        pageTitle(state: State, title: string) {
            state.pageTitle = title;
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
        markTaskDone(state: State, data: {taskId: string, timestamp: number}) {
            const {taskId, timestamp} = data;
            const task = state
                .households
                .map((household: Household) => household.tasks)
                .flat()
                .find((task: Task) => task.id === taskId);
            
            if (task) {
                task.lastComplete = timestamp;
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