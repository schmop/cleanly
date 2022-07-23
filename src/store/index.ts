import { createStore, GetterTree, MutationTree, Store } from 'vuex';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';
import { Task } from '@/models/Task';
import { Todo } from '@/models/Todo';
import { TaskLog } from '@/models/TaskLog';
import { InjectionKey } from 'vue';

export class State {
    loggedIn = false;
    households: Household[] = [];
    user: null | User = null;
    invites: Invite[] = [];
    pageTitle: null | string = null;
    taskLogs: Record<string, TaskLog[]> = {};
    viewedHousehold: null|number = null;
}

declare module '@vue/runtime-core' {
    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}

export const key: InjectionKey<Store<State>> = Symbol();

const getters = <GetterTree<State, any>> {
    checklist: (state: State) => (householdId: number) => {
        return state.households.find((household: Household) => household.id === householdId)?.checklist;
    },
    householdById: (state: State) => (householdId: number): undefined|Household => {
        return state.households.find((household: Household) => household.id === householdId);
    },
    taskLogs: (state: State): TaskLog[] => {
        return state.viewedHousehold ? state.taskLogs[state.viewedHousehold] : [];
    },
    household: (state: State, getters): undefined|Household => {
        return getters.householdById(state.viewedHousehold);
    },
    tasks: (state: State, getters): undefined|Household => {
        return getters.household.tasks;
    },
}

const mutations = <MutationTree<State>> {
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
};


export const store = createStore<State>({
    state: new State(),
    getters,
    mutations,
});

export default store;