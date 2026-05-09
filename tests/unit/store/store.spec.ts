import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/toast', () => ({ error: vi.fn(), warning: vi.fn() }));

import { reactive } from 'vue';
import { State, Store, type GetterFunctions } from '@/store';
import { Household } from '@/models/Household';
import { HouseholdPrivilege, PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { Task } from '@/models/Task';
import { User } from '@/models/User';
import { FinanceTransaction } from '@/components/HouseholdView/FinancesView/finance-types';

let store: Store;

// Mirror the getters in src/store/index.ts; closes over the module-level
// `store` so each beforeEach can swap in a fresh Store instance.
const getters: GetterFunctions = {
    checklists: () => (id) => store.state.households.find(h => h.id === id)?.checklists,
    householdById: () => (id) => store.state.households.find(h => h.id === id),
    household: () => {
        const v = store.state.viewedHousehold;
        return v == null ? undefined : store.getters.householdById.value(v);
    },
    privileges: () => (household) => {
        const used = household ?? store.getters.household.value;
        if (!used) return {};
        return used.privileges.reduce<Record<number, PrivilegeLevel>>(
            (acc, p) => Object.assign(acc, { [p.user]: p.privilege }),
            {},
        );
    },
    privilege: () => (userId, household) => {
        const u = userId ?? store.state.user?.id;
        if (!u) return PrivilegeLevel.USER;
        return store.getters.privileges.value(household)[u] ?? PrivilegeLevel.USER;
    },
    canManageTasks: () => (userId, household) =>
        store.getters.privilege.value(userId, household) >= PrivilegeLevel.MODERATOR,
    canManageChecklists: () => (userId, household) =>
        store.getters.privilege.value(userId, household) >= PrivilegeLevel.MODERATOR,
    canManageHousehold: () => (userId, household) =>
        store.getters.privilege.value(userId, household) === PrivilegeLevel.ADMIN,
    stars: () => {
        const v = store.state.viewedHousehold;
        return v == null ? {} : store.state.stars[v] ?? {};
    },
    tasks: () => store.getters.household.value?.tasks ?? [],
};

beforeEach(() => {
    store = new Store(reactive(new State()), getters);
});

function makeUser(id: number): User {
    return { id, name: `u${id}`, mail: `u${id}@x.com` };
}

function makeTask(id: number, overrides: Partial<Task> = {}): Task {
    return {
        id, name: `t${id}`, icon: 'i', hue: 0, assignee: null,
        lastComplete: null, duration: null, stars: 0, reminder: null,
        ...overrides,
    };
}

function makeHousehold(id: number, members: User[], privileges: HouseholdPrivilege[], tasks: Task[] = []): Household {
    return {
        id, name: `h${id}`, users: members, tasks,
        webhookUrl: null, privileges, checklists: [],
        reassignmentStrategy: 'none',
    };
}

describe('store getters', () => {
    it('privilege returns USER for non-members', () => {
        const u = makeUser(1);
        const h = makeHousehold(10, [u], [{ user: 1, household: 10, privilege: PrivilegeLevel.MODERATOR }]);
        store.state.households = [h];
        store.state.viewedHousehold = 10;
        store.state.user = u;

        expect(store.getters.privilege.value(99)).toBe(PrivilegeLevel.USER);
    });

    it('privilege defaults to the current user when no userId is given', () => {
        const u = makeUser(1);
        const h = makeHousehold(10, [u], [{ user: 1, household: 10, privilege: PrivilegeLevel.ADMIN }]);
        store.state.households = [h];
        store.state.viewedHousehold = 10;
        store.state.user = u;

        expect(store.getters.privilege.value()).toBe(PrivilegeLevel.ADMIN);
    });

    it('canManageTasks gates correctly across privilege levels', () => {
        const u = makeUser(1);
        const h = makeHousehold(10, [u], [{ user: 1, household: 10, privilege: PrivilegeLevel.USER }]);
        store.state.households = [h];
        store.state.viewedHousehold = 10;
        store.state.user = u;

        expect(store.getters.canManageTasks.value()).toBe(false);
        h.privileges[0]!.privilege = PrivilegeLevel.MODERATOR;
        expect(store.getters.canManageTasks.value()).toBe(true);
        h.privileges[0]!.privilege = PrivilegeLevel.ADMIN;
        expect(store.getters.canManageTasks.value()).toBe(true);
    });

    it('canManageHousehold requires ADMIN, not MODERATOR', () => {
        const u = makeUser(1);
        const h = makeHousehold(10, [u], [{ user: 1, household: 10, privilege: PrivilegeLevel.MODERATOR }]);
        store.state.households = [h];
        store.state.viewedHousehold = 10;
        store.state.user = u;

        expect(store.getters.canManageHousehold.value()).toBe(false);
        h.privileges[0]!.privilege = PrivilegeLevel.ADMIN;
        expect(store.getters.canManageHousehold.value()).toBe(true);
    });

    it('household getter returns undefined when no household is viewed', () => {
        store.state.viewedHousehold = null;
        expect(store.getters.household.value).toBeUndefined();
    });

    it('tasks getter returns the viewed household tasks', () => {
        const u = makeUser(1);
        const t = makeTask(1);
        const h = makeHousehold(10, [u], [], [t]);
        store.state.households = [h];
        store.state.viewedHousehold = 10;

        expect(store.getters.tasks.value).toEqual([t]);
    });

    it('stars getter returns the viewed household stars or empty', () => {
        store.state.stars = { 10: { 1: 5, 2: 3 } };
        store.state.viewedHousehold = 10;
        expect(store.getters.stars.value).toEqual({ 1: 5, 2: 3 });

        store.state.viewedHousehold = 999;
        expect(store.getters.stars.value).toEqual({});

        store.state.viewedHousehold = null;
        expect(store.getters.stars.value).toEqual({});
    });
});

describe('store mutations', () => {
    it('removeTask removes the task from its household', () => {
        const u = makeUser(1);
        const t1 = makeTask(1);
        const t2 = makeTask(2);
        store.state.households = [makeHousehold(10, [u], [], [t1, t2])];
        store.removeTask(1);
        expect(store.state.households[0]!.tasks.map(t => t.id)).toEqual([2]);
    });

    it('markTaskDone updates lastComplete only on the matching task', () => {
        const u = makeUser(1);
        const t1 = makeTask(1);
        const t2 = makeTask(2);
        store.state.households = [makeHousehold(10, [u], [], [t1, t2])];
        store.markTaskDone(10, 1, 12345);
        expect(store.state.households[0]!.tasks[0]!.lastComplete).toBe(12345);
        expect(store.state.households[0]!.tasks[1]!.lastComplete).toBeNull();
    });

    it('markTaskDone is a no-op for unknown tasks', () => {
        const u = makeUser(1);
        const t = makeTask(1);
        store.state.households = [makeHousehold(10, [u], [], [t])];
        expect(() => store.markTaskDone(10, 999, 1)).not.toThrow();
        expect(store.state.households[0]!.tasks[0]!.lastComplete).toBeNull();
    });

    it('assignTask sets the assignee on the matching task', () => {
        const u = makeUser(1);
        const t = makeTask(1);
        store.state.households = [makeHousehold(10, [u], [], [t])];
        store.assignTask(10, 1, 7);
        expect(store.state.households[0]!.tasks[0]!.assignee).toBe(7);
        store.assignTask(10, 1, null);
        expect(store.state.households[0]!.tasks[0]!.assignee).toBeNull();
    });

    it('setTransactions sorts by date descending', () => {
        const txs: FinanceTransaction[] = [
            { uuid: 'a', title: 'old', date: '2020-01-01T00:00:00Z' } as FinanceTransaction,
            { uuid: 'b', title: 'new', date: '2024-01-01T00:00:00Z' } as FinanceTransaction,
            { uuid: 'c', title: 'mid', date: '2022-01-01T00:00:00Z' } as FinanceTransaction,
        ];
        store.setTransactions(10, txs);
        expect(store.state.financeTransactions[10]!.map(t => t.uuid)).toEqual(['b', 'c', 'a']);
    });

    it('addTransaction inserts and re-sorts by date descending', () => {
        store.setTransactions(10, [
            { uuid: 'a', title: 'old', date: '2020-01-01T00:00:00Z' } as FinanceTransaction,
        ]);
        store.addTransaction(10, { uuid: 'new', title: 'newest', date: '2025-01-01T00:00:00Z' } as FinanceTransaction);
        store.addTransaction(10, { uuid: 'mid', title: 'mid', date: '2022-01-01T00:00:00Z' } as FinanceTransaction);

        expect(store.state.financeTransactions[10]!.map(t => t.uuid)).toEqual(['new', 'mid', 'a']);
    });

    it('removeTransaction filters by uuid only within the matching household', () => {
        store.setTransactions(10, [
            { uuid: 'a', date: '2024-01-01' } as FinanceTransaction,
            { uuid: 'b', date: '2023-01-01' } as FinanceTransaction,
        ]);
        store.setTransactions(20, [{ uuid: 'a', date: '2024-01-01' } as FinanceTransaction]);

        store.removeTransaction(10, 'a');

        expect(store.state.financeTransactions[10]!.map(t => t.uuid)).toEqual(['b']);
        expect(store.state.financeTransactions[20]!.map(t => t.uuid)).toEqual(['a']);
    });

    it('subscribe / unsubscribe checklist round-trips', () => {
        store.subscribeToChecklist('cl-1');
        store.subscribeToChecklist('cl-2');
        expect(store.state.checklistSubscriptions).toEqual(['cl-1', 'cl-2']);
        store.unsubscribeFromChecklist('cl-1');
        expect(store.state.checklistSubscriptions).toEqual(['cl-2']);
    });

    it('renameChecklist throws when the checklist is missing', () => {
        store.state.households = [makeHousehold(10, [], [])];
        expect(() => store.renameChecklist('no-such', 'X')).toThrow(/not found/i);
    });

    it('renameChecklist updates the matching checklist by uuid', () => {
        const u = makeUser(1);
        const h = makeHousehold(10, [u], []);
        h.checklists = [{ name: 'old', uuid: 'cl-1', checklist: [], rank: '0' }];
        store.state.households = [h];
        store.renameChecklist('cl-1', 'new-name');
        expect(store.state.households[0]!.checklists[0]!.name).toBe('new-name');
    });

    it('login / logout flips loggedIn state', () => {
        store.login();
        expect(store.state.loggedIn).toBe(true);
        store.logout();
        expect(store.state.loggedIn).toBe(false);
    });

    it('addStars replaces the per-household record (not a merge)', () => {
        store.addStars(10, [{ user: 1, stars: 5 }, { user: 2, stars: 3 }]);
        expect(store.state.stars[10]).toEqual({ 1: 5, 2: 3 });
        store.addStars(10, [{ user: 3, stars: 9 }]);
        expect(store.state.stars[10]).toEqual({ 3: 9 });
    });

    it('removeInvite removes by reference equality on the reactive entry', () => {
        store.state.invites = [
            { householdId: 1, householdName: 'a', inviter: null },
            { householdId: 2, householdName: 'b', inviter: null },
        ];
        // After the reactive wrap, equality must use the proxied entries — that's
        // what the production code receives from store.state.invites lookups.
        const target = store.state.invites[0]!;
        store.removeInvite(target);
        expect(store.state.invites.map(i => i.householdId)).toEqual([2]);
    });
});
