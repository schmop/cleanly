import { Household } from '../models/Household';
import { User } from '../models/User';
import { Invite } from '../models/Invite';
import { Task } from '@/models/Task';
import { Todo } from '@/models/Todo';
import { TaskLog } from '@/models/TaskLog';
import { reactive, computed, App, ComputedRef } from 'vue';

export class State {
    loggedIn = false;
    households: Household[] = [];
    user: null | User = null;
    invites: Invite[] = [];
    pageTitle: null | string = null;
    taskLogs: Record<string, TaskLog[]> = {};
    viewedHousehold: null | number = null;
}

type Getters = {
    checklist: (householdId: number) => Todo[],
    householdById: (householdId: number) => undefined | Household,
    taskLogs: TaskLog[],
    household: undefined | Household,
    tasks: Task[],
};
type GetterFunctions = {[key in keyof Getters]: () => Getters[key]};
type ComputedGetters = {[key in keyof Getters]: ComputedRef<Getters[key]>};

function makeGettersReactive(getters: GetterFunctions): ComputedGetters {
    return Object.fromEntries(
        Object.entries(getters).map(([key, getter]) => [key, computed(getter as any)])
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

abstract class CommittableStore {
    /**
     * @deprecated Do not use commit anymore, because you will lose type safety
     */
    commit(action: keyof this, data?: any): void {
        console.warn('DEPRECATION WARNING: `store.commit()` was called, but should not be used anymore!');
        if (action in this && 'function' === typeof this[action]) {
            (this[action] as any as CallableFunction)(data);
        } else {
            console.error('Could not commit, because the action does not exist:', action);
        }
    }
}

abstract class VueStorePlugin extends CommittableStore {
    /** Used to register as a Vue Plugin */
    install(app: App) {
        app.provide('store', this);
    }
}

export class Store extends VueStorePlugin {
    public readonly state: State;
    public readonly getters: ComputedGetters;
    constructor(
        state: State,
        getters: GetterFunctions,
    ) {
        super();
        this.state = state;
        this.getters = makeGettersReactive(getters);
    }

    login() {
        this.state.loggedIn = true;
    }
    logout() {
        this.state.loggedIn = false;
    }
    user(user: User) {
        this.state.user = user;
    }
    pageTitle(title: string|null) {
        this.state.pageTitle = title;
    }
    viewHousehold(householdId: null|number) {
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
    markTaskDone(data: { taskId: string, timestamp: number }) {
        const { taskId, timestamp } = data;
        const task = this.state
            .households
            .map((household: Household) => household.tasks)
            .flat()
            .find((task: Task) => task.id === taskId);

        if (task) {
            task.lastComplete = timestamp;
        }
    }
    updateChecklist(data: { household_id: number, checklist: Todo[] }) {
        const { household_id, checklist } = data;
        const household = this.state.households.find(household => household.id === household_id);
        if (household) {
            household.checklist = checklist;
        }
    }
    dashboard(data: { households: Household[], user: User, invites: Invite[] }) {
        this.state.households = data.households;
        this.state.user = data.user;
        this.state.invites = data.invites;
    }
    removeInvite(inviteToRemove: Invite) {
        this.state.invites = this.state.invites.filter(invite => invite !== inviteToRemove);
    }
    joinHousehold(household: Household) {
        this.state.households.push(household);
    }
}

const state = reactive(new State());



export const store = new Store(
    state,
    getters,
);

(window as any).store = store;

export function mapGetters(reducer: string[]): Partial<Getters> {
    return Object.fromEntries(
        Object.entries(getters).filter(([name, getter]) => {
            return reducer.includes(name);
        })
    );
}
export function mapState(reducer: string[]): Partial<State> {
    return Object.fromEntries(
        Object.entries(state).filter(([name, state]) => {
            return reducer.includes(name);
        })
    );
}

/** 
 * For use in composition API
 */
export function useStore(): Store {
    return store;
}