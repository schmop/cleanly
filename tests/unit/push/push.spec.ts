import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/toast', () => ({ error: vi.fn(), warning: vi.fn() }));

const listenerCallbacks: Record<string, (...args: unknown[]) => void> = {};

vi.mock('@capacitor/push-notifications', () => ({
    PushNotifications: {
        checkPermissions: vi.fn(() => Promise.resolve({ receive: 'granted' })),
        requestPermissions: vi.fn(() => Promise.resolve({ receive: 'granted' })),
        addListener: vi.fn((event: string, cb: (...a: unknown[]) => void) => {
            listenerCallbacks[event] = cb;
            return Promise.resolve({ remove: () => Promise.resolve() });
        }),
        register: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@capacitor/device', () => ({
    Device: {
        getId: vi.fn(() => Promise.resolve({ identifier: 'dev-1' })),
    },
}));

import { reactive } from 'vue';
import { PushService } from '@/push';
import { makeGetters, State, Store } from '@/store';
import type { Router } from 'vue-router';
import type { Household } from '@/models/Household';

// PushService relies on Vue's `watch` over store.state.households, which only
// fires when the state is wrapped in `reactive`. The shared storeFixture uses
// a plain object, so this file builds its own.
function createReactiveStore(): Store {
    const state = reactive(new State());
    return new Store(state, makeGetters);
}

interface RouterMock { push: ReturnType<typeof vi.fn>; }

function makeRouter(): RouterMock {
    return { push: vi.fn(() => Promise.resolve()) };
}

function household(id: number): Household {
    return {
        id, name: `h${id}`, users: [], tasks: [],
        webhookUrl: null, privileges: [], checklists: [], reassignmentStrategy: 'none',
    };
}

beforeEach(() => {
    Object.keys(listenerCallbacks).forEach(k => delete listenerCallbacks[k]);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('PushService.dispatch routing', () => {
    it('routes invite notifications to invite-view (no household lookup needed)', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'invite', householdId: '99' } },
        });
        await flush();

        expect(router.push).toHaveBeenCalledWith({ name: 'invite-view' });
    });

    it('defers task notifications until the matching household is loaded', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        // Action arrives for a household we don't yet know about.
        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'task_done', householdId: '42', taskId: '7' } },
        });
        await flush();
        expect(router.push).not.toHaveBeenCalled();
        expect(store.state.viewedHousehold).toBeNull();

        // Household becomes available — the watch fires dispatch.
        store.state.households = [household(42)];
        await flush();

        expect(router.push).toHaveBeenCalledWith({ name: 'tasks' });
        expect(store.state.viewedHousehold).toBe(42);
    });

    it('routes checklist_update by opening the named checklist and pushing /checklist', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        store.state.households = [household(42)];
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'checklist_update', householdId: '42', checklistUuid: 'cl-1' } },
        });
        await flush();

        expect(store.state.openChecklist).toBe('cl-1');
        expect(router.push).toHaveBeenCalledWith({ name: 'checklist' });
    });

    it('routes finance_transaction to finances', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        store.state.households = [household(42)];
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'finance_transaction', householdId: '42', transactionUuid: 'tx-1' } },
        });
        await flush();

        expect(router.push).toHaveBeenCalledWith({ name: 'finances' });
    });

    it('routes task_assign to tasks view', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        store.state.households = [household(42)];
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'task_assign', householdId: '42', taskId: '5' } },
        });
        await flush();

        expect(router.push).toHaveBeenCalledWith({ name: 'tasks' });
    });

    it('does not dispatch before markReady is called', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        store.state.households = [household(42)];
        new PushService(store, router as unknown as Router);
        await flush();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'task_done', householdId: '42', taskId: '5' } },
        });
        await flush();

        expect(router.push).not.toHaveBeenCalled();
    });

    it('drops malformed notification payloads (no router push, no pending action)', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        store.state.households = [household(42)];
        const service = new PushService(store, router as unknown as Router);
        await flush();
        service.markReady();

        listenerCallbacks.pushNotificationActionPerformed!({
            notification: { data: { type: 'unknown', householdId: '42' } },
        });
        await flush();

        expect(router.push).not.toHaveBeenCalled();
    });
});

describe('PushService.getPushId', () => {
    it('resolves with the registered token', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        const service = new PushService(store, router as unknown as Router);
        await flush();

        // Simulate the FCM transport delivering a token.
        listenerCallbacks.registration!({ value: 'token-xyz' });

        await expect(service.getPushId()).resolves.toBe('token-xyz');
    });

    it('returns the device identifier from Capacitor', async () => {
        const router = makeRouter();
        const store = createReactiveStore();
        const service = new PushService(store, router as unknown as Router);
        await flush();

        await expect(service.getDeviceId()).resolves.toBe('dev-1');
    });
});

// Wait for any chained microtasks to settle.
async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve();
    }
}
