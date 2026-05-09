import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/toast', () => ({ error: vi.fn(), warning: vi.fn() }));
vi.mock('@/client/response/handle-error-response', () => ({
    handleErrorResponse: vi.fn((_resp, action: string) => {
        throw new Error(`error: ${action}`);
    }),
}));

import { HouseholdClient } from '@/client/household-client';
import { AuthClient } from '@/client/auth-client';
import { createStoreFixture } from '../../helpers/storeFixture';
import { Invite } from '@/models/Invite';
import { PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { Household } from '@/models/Household';
import type { Store } from '@/store';

interface AuthMock {
    requestImmediately: ReturnType<typeof vi.fn>;
    requestEventually: ReturnType<typeof vi.fn>;
    sendJsonEventually: ReturnType<typeof vi.fn>;
}

function makeAuth(): AuthMock {
    return {
        requestImmediately: vi.fn(),
        requestEventually: vi.fn(),
        sendJsonEventually: vi.fn(),
    };
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

let auth: AuthMock;
let store: Store;
let client: HouseholdClient;

beforeEach(() => {
    auth = makeAuth();
    store = createStoreFixture();
    client = new HouseholdClient(auth as unknown as AuthClient, store);
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('HouseholdClient.dashboardInfo', () => {
    const validDashboard = {
        user: { id: 1, name: 'me', mail: 'me@x.com' },
        households: [],
        invites: [],
        checklistSubscriptions: [],
        settings: {
            notifyInvites: true, notifyTaskDone: true, notifyTaskDue: true,
            notifyNewTransactions: true, swipeToFinishTasks: true, language: 'de',
        },
    };

    it('populates store on a valid response', async () => {
        auth.requestImmediately.mockResolvedValueOnce(jsonResponse(validDashboard));
        await client.dashboardInfo();

        expect(store.state.user).toEqual(validDashboard.user);
        expect(store.state.households).toEqual([]);
        expect(store.state.userSettings).toEqual(validDashboard.settings);
    });

    it('throws on non-200 status', async () => {
        auth.requestImmediately.mockResolvedValueOnce(jsonResponse({}, 401));
        await expect(client.dashboardInfo()).rejects.toThrow();
    });

    it('throws on payload that fails the type guard', async () => {
        auth.requestImmediately.mockResolvedValueOnce(jsonResponse({ bogus: true }));
        await expect(client.dashboardInfo()).rejects.toThrow(/Invalid dashboard/);
    });
});

describe('HouseholdClient.acceptInvite', () => {
    const invite: Invite = { householdId: 42, householdName: 'Casa', inviter: null };
    const validHousehold: Household = {
        id: 42, name: 'Casa', users: [], tasks: [],
        webhookUrl: null, privileges: [], checklists: [], reassignmentStrategy: 'none',
    };

    it('joins the returned household on success', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({ household: validHousehold }));
        await client.acceptInvite(invite);
        expect(store.state.households).toEqual([validHousehold]);
        expect(auth.requestEventually).toHaveBeenCalledWith(
            'POST', 'api/household/accept-invite/42',
        );
    });

    it('does not mutate store on error response', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({ message: 'denied' }, 403));
        await expect(client.acceptInvite(invite)).rejects.toThrow();
        expect(store.state.households).toEqual([]);
    });

    it('throws when payload fails the type guard', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({ no_household: true }));
        await expect(client.acceptInvite(invite)).rejects.toThrow(/Invalid invite response/);
        expect(store.state.households).toEqual([]);
    });
});

describe('HouseholdClient.kickFromHousehold', () => {
    it('returns true on success', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await expect(client.kickFromHousehold(7, 42)).resolves.toBe(true);
        expect(auth.requestEventually).toHaveBeenCalledWith(
            'POST', 'api/household/kick/42/7',
        );
    });

    it('returns false on failure (does not throw)', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 500));
        await expect(client.kickFromHousehold(7, 42)).resolves.toBe(false);
    });
});

describe('HouseholdClient.changePrivilege', () => {
    it('issues a POST that includes the privilege level in the URL', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await client.changePrivilege(7, 42, PrivilegeLevel.MODERATOR);
        expect(auth.requestEventually).toHaveBeenCalledWith(
            'POST',
            `api/household/privilege/42/7/${PrivilegeLevel.MODERATOR}`,
        );
    });

    it('surfaces server errors via handleErrorResponse', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 403));
        await expect(client.changePrivilege(7, 42, PrivilegeLevel.ADMIN)).rejects.toThrow();
    });
});

describe('HouseholdClient.retrieveStars', () => {
    it('writes the response into store.stars[householdId]', async () => {
        auth.requestImmediately.mockResolvedValueOnce(jsonResponse([
            { user: 1, stars: 5 },
            { user: 2, stars: 3 },
        ]));
        await client.retrieveStars(42);
        expect(store.state.stars[42]).toEqual({ 1: 5, 2: 3 });
    });

    it('throws on payload that fails the type guard', async () => {
        auth.requestImmediately.mockResolvedValueOnce(jsonResponse({ wrong: 'shape' }));
        await expect(client.retrieveStars(42)).rejects.toThrow(/Invalid star/);
    });
});

describe('HouseholdClient.createHousehold', () => {
    it('posts FormData with the name', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await client.createHousehold('My Place');

        expect(auth.requestEventually).toHaveBeenCalledTimes(1);
        const args = auth.requestEventually.mock.calls[0]!;
        expect(args[0]).toBe('POST');
        expect(args[1]).toBe('api/household/create');
        const body = args[2] as FormData;
        expect(body).toBeInstanceOf(FormData);
        expect(body.get('name')).toBe('My Place');
    });
});

describe('HouseholdClient.invite', () => {
    it('sends a JSON body with the user id list', async () => {
        auth.sendJsonEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await client.invite(42, 7, 8, 9);

        expect(auth.sendJsonEventually).toHaveBeenCalledWith(
            'POST', 'api/household/invite/42', { ids: [7, 8, 9] },
        );
    });
});

describe('HouseholdClient.declineInvite', () => {
    it('does not mutate store and does not throw on success', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await client.declineInvite({ householdId: 42, householdName: 'x', inviter: null });
        expect(store.state.households).toEqual([]);
    });
});

describe('HouseholdClient.removeHousehold', () => {
    it('issues a DELETE request and returns true on success', async () => {
        auth.requestEventually.mockResolvedValueOnce(jsonResponse({}, 200));
        await expect(client.removeHousehold(42)).resolves.toBe(true);
        expect(auth.requestEventually).toHaveBeenCalledWith('DELETE', 'api/household/42');
    });
});
