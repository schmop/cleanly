import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';
import { Task } from '@/models/Task';
import { Todo } from '@/models/Todo';
import { TaskLog } from '@/models/TaskLog';
import { reactive, computed, App, ComputedRef, InjectionKey } from 'vue';
import { storeSymbol, stateSymbol, gettersSymbol } from '@/dependency-injection/injection-keys';

export class State {
    loggedIn = false;
    households: Household[] = [];
    user: null | User = null;
    invites: Invite[] = [];
    pageTitle: null | string = null;
    taskLogs: Record<string, TaskLog[]> = {};
    viewedHousehold: null | number = null;
}

export type Getters = {
    checklist: (householdId: number) => Todo[],
    householdById: (householdId: number) => undefined | Household,
    taskLogs: TaskLog[],
    household: undefined | Household,
    tasks: Task[],
};
export type GetterFunctions = { [key in keyof Getters]: () => Getters[key] };
export type ComputedGetters = { [key in keyof Getters]: ComputedRef<Getters[key]> };

function makeGettersReactive(getters: GetterFunctions): ComputedGetters {
    return Object.fromEntries(
        Object.entries(getters).map(
            ([key, getter]) => [key, computed(getter as any)]
        )
    ) as ComputedGetters;
}

const getters: GetterFunctions = {
    checklist: () => (householdId: number): Todo[] => {
        return store.state.households.find((household: Household) => household.id === householdId)?.checklist ?? [];
    },
    householdById: () => (householdId: number): undefined | Household => {
        return store.state.households.find((household: Household) => household.id === householdId);
    },
    taskLogs: (): TaskLog[] => {
        const { viewedHousehold } = store.state;
        if (null === viewedHousehold) {
            return [];
        }

        return store.state.taskLogs[viewedHousehold] ?? [];
    },
    household: (): undefined | Household => {
        const { viewedHousehold } = store.state;
        if (null === viewedHousehold) {
            return undefined;
        }

        return store.getters.householdById.value(viewedHousehold);
    },
    tasks: (): Task[] => {
        return store.getters.household.value?.tasks ?? [];
    },
};

export class Store {
    public readonly state: State;
    public readonly getters: ComputedGetters;
    constructor(
        state: State,
        getters: GetterFunctions,
    ) {
        this.state = state;
        this.getters = makeGettersReactive(getters);
    }

    /** Used to register as a Vue Plugin */
    install(app: App) {
        app.provide(storeSymbol, this);
        app.provide(stateSymbol, this.state);
        app.provide(gettersSymbol, this.getters);
    }

    /**
     * Mutations
     */
    login() {
        this.state.loggedIn = true;
    }
    logout() {
        this.state.loggedIn = false;
    }
    user(user: User) {
        this.state.user = user;
    }
    pageTitle(title: string | null) {
        this.state.pageTitle = title;
    }
    viewHousehold(householdId: null | number) {
        this.state.viewedHousehold = householdId;
    }
    logs(logs: TaskLog[], householdId: number) {
        const household = this.state.households.find((household) => household.id === householdId);
        if (null == household) {
            throw new Error('Could not mutate logs, invalid household id given!');
        }

        this.state.taskLogs[householdId] = logs;
    }
    removeTask(taskId: string) {
        const household = this.state
            .households
            .find(
                (h: Household) => h.tasks.some((t: Task) => t.id === taskId)
            );
        if (household != null) {
            household.tasks.splice(household.tasks.findIndex((t: Task) => t.id === taskId), 1);
        }
    }
    markTaskDone(taskId: string, timestamp: number) {
        const task = this.state
            .households
            .map((household: Household) => household.tasks)
            .flat()
            .find((task: Task) => task.id === taskId);

        if (task) {
            task.lastComplete = timestamp;
        }
    }
    dashboard(households: Household[], user: User, invites: Invite[]) {
        this.state.households = households;
        this.state.user = user;
        this.state.invites = invites;
    }
    removeInvite(inviteToRemove: Invite) {
        this.state.invites = this.state.invites.filter(invite => invite !== inviteToRemove);
    }
    joinHousehold(household: Household) {
        this.state.households.push(household);
    }

    /**
     * Actions
     */
}

const state = reactive(new State());

export const store = new Store(
    state,
    getters,
);
if (process.env.NODE_ENV !== 'production') {
    /**
     * This replaces the Vuex-Dev-Tools (in a poorly fashioned way)
     */
    (window as any).store = store;
}
