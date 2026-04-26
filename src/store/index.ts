import { gettersSymbol, stateSymbol, storeSymbol } from '@/dependency-injection/injection-keys';
import { Checklist, Household } from '@/models/Household';
import { HouseholdPrivilege, PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { Invite } from '@/models/Invite';
import { Task } from '@/models/Task';
import { User } from '@/models/User';
import { UserSettings } from '@/models/UserSettings';
import { Localstore } from "@/store/localstore";
import { ChecklistUuid, HouseholdId, StarsRecord, TaskId, UserId } from '@/types';
import { App, computed, ComputedGetter, ComputedRef, reactive } from 'vue';
import { FinanceSummary, FinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types";
import { getDefaultWebHost } from "@/client/host";

export class State {
    public loggedIn = false;
    public households: Household[] = [];
    public user: null|User = null;
    public checklistSubscriptions: ChecklistUuid[] = [];
    public invites: Invite[] = [];
    public pageTitle: null|string = null;
    public viewedHousehold: null|number = null;
    public openChecklist: null|string = null;
    public financeTransactions: Record<HouseholdId, FinanceTransaction[]> = {};
    public financeSummaries: Record<HouseholdId, FinanceSummary> = {};
    public userSettings: UserSettings = {
        notifyInvites: true,
        notifyTaskDone: true,
        notifyTaskDue: true,
        notifyNewTransactions: true,
        swipeToFinishTasks: true,
        language: 'de',
    };
    public stars: Record<HouseholdId, StarsRecord> = {};
    public darkmode = false;
    public serverUrl: string = getDefaultWebHost();
}

/** @see {isState} ts-auto-guard:type-guard */
export type StateInterface = Pick<State, keyof State>;

export type Getters = {
    checklists: (householdId: number) => Checklist[]|undefined,
    householdById: (householdId: number) => undefined|Household,
    household: undefined|Household,
    privileges: (household?: Household) => Record<UserId, PrivilegeLevel>,
    privilege: (userId?: UserId, household?: Household) => PrivilegeLevel,
    canManageTasks: (userId?: UserId, household?: Household) => boolean,
    canManageChecklists: (userId?: UserId, household?: Household) => boolean,
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
    checklists: () => (householdId: number): Checklist[]|undefined => {
        return store.state.households.find((household: Household) => household.id === householdId)?.checklists;
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
    canManageChecklists: () => (userId?: UserId, household?: Household): boolean => {
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
    private _state: State;
    public get state() {
        return this._state;
    }

    private set state(state: State) {
        this._state = state;
    }

    public readonly getters: ComputedGetters;

    constructor(
        state: State,
        getters: GetterFunctions,
    ) {
        this._state = state;
        this.getters = makeGettersReactive(getters);
    }

    /** Used to register as a Vue Plugin */
    install(app: App) {
        app.provide(storeSymbol, this);
        app.provide(stateSymbol, this.state);
        app.provide(gettersSymbol, this.getters);
    }

    overrideState(state: State) {
        this.state = state;
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

    setServerUrl(url: string) {
        this.state.serverUrl = url;
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

    dashboard(households: Household[], user: User, invites: Invite[], checklistSubscriptions: ChecklistUuid[]) {
        this.state.households = households;
        this.state.user = user;
        this.state.invites = invites;
        this.state.checklistSubscriptions = checklistSubscriptions;
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

    setTransactions(householdId: HouseholdId, transactions: FinanceTransaction[]) {
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.state.financeTransactions[householdId] = transactions;
    }

    removeTransaction(householdId: HouseholdId, transactionId: string) {
        const transactions = this.state.financeTransactions[householdId] ?? [];
        this.state.financeTransactions[householdId] = transactions.filter(t => t.uuid !== transactionId);
    }

    addTransaction(householdId: HouseholdId, transaction: FinanceTransaction) {
        const transactions = this.state.financeTransactions[householdId] ?? [];
        transactions.push(transaction);
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.state.financeTransactions[householdId] = transactions;
    }

    setFinanceSummary(householdId: HouseholdId, financeSummary: FinanceSummary) {
        this.state.financeSummaries[householdId] = financeSummary;
    }

    joinHousehold(household: Household) {
        this.state.households.push(household);
    }

    reorderHouseholds(households: Household[]) {
        this.state.households = households;
    }

    setSettings(settings: UserSettings) {
        this.state.userSettings = settings;
    }

    setReassignmentStrategy(household: Household, reassignmentStrategy: string) {
        household.reassignmentStrategy = reassignmentStrategy;
    }

    renameHousehold(household: Household, name: string) {
        household.name = name;
    }

    setDarkmode(darkmode: boolean) {
        this.state.darkmode = darkmode;
    }

    openChecklist(uuid: string) {
        this.state.openChecklist = uuid;
    }

    renameChecklist(uuid: ChecklistUuid, newName: string) {
        const checklist = this.state.households
            .flatMap(household => household.checklists)
            .find((checklist) => checklist.uuid === uuid);
        if (null == checklist) {
            throw new Error('Checklist not found, cannot rename');
        }
        checklist.name = newName;
    }

    subscribeToChecklist(uuid: ChecklistUuid) {
        this.state.checklistSubscriptions.push(uuid);
    }

    unsubscribeFromChecklist(uuid: ChecklistUuid) {
        this.state.checklistSubscriptions = this.state.checklistSubscriptions.filter(sub => sub !== uuid);
    }
}

const state = reactive(new State());

export const store = new Store(
    state,
    getters,
);

export const localstore = new Localstore(store);
localstore.init();

declare global {
    interface Window {
        store: Store;
    }
}

if (import.meta.env.DEV) {
    /**
     * This replaces the Vuex-Dev-Tools (in a poorly fashioned way)
     */
    window.store = store;
}
