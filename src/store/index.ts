import { gettersSymbol, stateSymbol, storeSymbol } from '@/dependency-injection/injection-keys';
import { Household } from '@/models/Household';
import { HouseholdPrivilege, PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { Invite } from '@/models/Invite';
import { Task } from '@/models/Task';
import { Todo } from '@/models/Todo';
import { User } from '@/models/User';
import { UserSettings } from '@/models/UserSettings';
import { HouseholdId, StarsRecord, TaskId, UserId } from '@/types';
import { App, computed, ComputedGetter, ComputedRef, reactive } from 'vue';

export class State {
    loggedIn = false;
    households: Household[] = [];
    user: null|User = null;
    invites: Invite[] = [];
    pageTitle: null|string = null;
    viewedHousehold: null|number = null;
    userSettings: UserSettings = {
        notifyInvites: true,
        notifyTaskDone: true,
        notifyTaskDue: true,
        language: 'de',
    };
    stars: Record<HouseholdId, StarsRecord> = {};
    darkmode = false;
}

export type Getters = {
    checklist: (householdId: number) => Todo[],
    householdById: (householdId: number) => undefined|Household,
    household: undefined|Household,
    privileges: (household?: Household) => Record<UserId, PrivilegeLevel>,
    privilege: (userId?: UserId, household?: Household) => PrivilegeLevel,
    canManageTasks: (userId?: UserId, household?: Household) => boolean,
    canManageHousehold: (userId?: UserId, household?: Household) => boolean,
    stars: StarsRecord,
    tasks: Task[],
};
export type GetterFunctions = { [key in keyof Getters]: ComputedGetter<Getters[key]> };
export type ComputedGetters = { [key in keyof Getters]: ComputedRef<Getters[key]> };

function makeGettersReactive(getters: GetterFunctions): ComputedGetters {
    return Object.fromEntries(
        Object.entries(getters).map(
            ([key, getter]) => [key, computed(getter as ComputedGetter<any>)]
        )
    ) as ComputedGetters;
}

const getters: GetterFunctions = {
    checklist: () => (householdId: number): Todo[] => {
        return store.state.households.find((household: Household) => household.id === householdId)?.checklist ?? [];
    },
    householdById: () => (householdId: number): undefined|Household => {
        return store.state.households.find((household: Household) => household.id === householdId);
    },
    household: (): undefined|Household => {
        const {viewedHousehold} = store.state;
        if (null === viewedHousehold) {
            return undefined;
        }

        return store.getters.householdById.value(viewedHousehold);
    },
    privileges: () => (household?: Household): Record<UserId, PrivilegeLevel> => {
        const usedHousehold = household ?? store.getters.household.value;
        if (undefined === usedHousehold) {
            return {};
        }

        return usedHousehold.privileges.reduce((accumulator, privilege: HouseholdPrivilege) => {
            return Object.assign(accumulator, {[privilege.user]: privilege.privilege});
        }, {});
    },
    privilege: () => (userId?: UserId, household?: Household): PrivilegeLevel => {
        const user = userId ?? store.state.user?.id;
        if (!user) {
            return PrivilegeLevel.USER;
        }

        return store.getters.privileges.value(household)[user] ?? PrivilegeLevel.USER;
    },
    canManageTasks: () => (userId?: UserId, household?: Household): boolean => {
        const privilege = store.getters.privilege.value(userId, household);

        return privilege >= PrivilegeLevel.MODERATOR;
    },
    canManageHousehold: () => (userId?: UserId, household?: Household): boolean => {
        const privilege = store.getters.privilege.value(userId, household);

        return privilege === PrivilegeLevel.ADMIN;
    },
    stars: (): StarsRecord => {
        const {viewedHousehold} = store.state;
        if (null === viewedHousehold) {
            return {};
        }

        return store.state.stars[viewedHousehold] ?? {};
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

    pageTitle(title: string|null) {
        this.state.pageTitle = title;
    }

    viewHousehold(householdId: null|number) {
        this.state.viewedHousehold = householdId;
    }

    removeTask(taskId: number) {
        const household = this.state
            .households
            .find(
                (h: Household) => h.tasks.some((t: Task) => t.id === taskId)
            );
        if (household != null) {
            household.tasks.splice(household.tasks.findIndex((t: Task) => t.id === taskId), 1);
        }
    }

    markTaskDone(householdId: HouseholdId, taskId: TaskId, timestamp: number) {
        const task = this.state
            .households
            .find((household) => household.id === householdId)
            ?.tasks
            .find((task: Task) => task.id === taskId);

        if (task) {
            task.lastComplete = timestamp;
        }
    }

    addInvite(invite: Invite) {
        this.state.invites.push(invite);
    }

    dashboard(households: Household[], user: User, invites: Invite[]) {
        this.state.households = households;
        this.state.user = user;
        this.state.invites = invites;
    }

    addStars(householdId: number, entries: {user: UserId, stars: number}[]) {
        const householdStars: StarsRecord = {};
        entries.forEach(({user, stars}) => {
            householdStars[user] = stars;
        });
        this.state.stars[householdId] = householdStars;
    }

    removeInvite(inviteToRemove: Invite) {
        this.state.invites = this.state.invites.filter(invite => invite !== inviteToRemove);
    }

    assignTask(householdId: HouseholdId, taskId: TaskId, userId: UserId|null) {
        const task = this.state
            .households
            .find((household) => household.id === householdId)
            ?.tasks
            .find((task: Task) => task.id === taskId);

        if (task) {
            task.assignee = userId;
        }
    }

    joinHousehold(household: Household) {
        this.state.households.push(household);
    }

    setSettings(settings: UserSettings) {
        this.state.userSettings = settings;
    }

    setReassignmentStrategy(household: Household, reassignmentStrategy: string) {
        household.reassignmentStrategy = reassignmentStrategy;
    }

    setDarkmode(darkmode: boolean) {
        this.state.darkmode = darkmode;
    }
}

const state = reactive(new State());

export const store = new Store(
    state,
    getters,
);

declare global {
    interface Window {
        store: Store;
    }
}

if (process.env.NODE_ENV !== 'production') {
    /**
     * This replaces the Vuex-Dev-Tools (in a poorly fashioned way)
     */
    window.store = store;
}
