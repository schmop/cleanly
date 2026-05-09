import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/toast', () => ({ error: vi.fn(), warning: vi.fn() }));
vi.mock('@/router', () => ({ default: { replace: vi.fn(() => Promise.resolve()) } }));
vi.mock('@/common/sleep', () => ({ sleep: () => Promise.resolve() }));
vi.mock('@/client/client', () => ({
    fetchImmediately: vi.fn(),
    fetchJsonImmediately: vi.fn(),
}));

import { fetchImmediately, fetchJsonImmediately } from '@/client/client';
import { AuthClient, RetryStrategy } from '@/client/auth-client';
import { Store } from '@/store';
import { createStoreFixture } from '../../helpers/storeFixture';
import router from '@/router';

const fetchMock = vi.mocked(fetchImmediately);
const fetchJsonMock = vi.mocked(fetchJsonImmediately);

interface MockSse { setTokenCallback: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>; }
interface MockPush { getPushId: ReturnType<typeof vi.fn>; getDeviceId: ReturnType<typeof vi.fn>; }

function makeClient(): { auth: AuthClient; store: Store; sse: MockSse; push: MockPush } {
    const store = createStoreFixture();
    const sse: MockSse = { setTokenCallback: vi.fn(), close: vi.fn() };
    const push: MockPush = {
        getPushId: vi.fn(() => Promise.resolve(null)),
        getDeviceId: vi.fn(() => Promise.resolve('dev-1')),
    };
    // Cast through unknown — these mocks satisfy the surface AuthClient touches.
    const auth = new AuthClient(store, push as unknown as never, sse as unknown as never);
    return { auth, store, sse, push };
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
}

describe('AuthClient', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.mockReset();
        fetchJsonMock.mockReset();
        // Default: any call we didn't queue with mockResolvedValueOnce gets a fresh 200.
        // mockResolvedValue would hand out the same Response repeatedly, which can't
        // be re-read; mockImplementation builds a fresh one per call.
        fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ ok: true }, 200)));
        (router.replace as ReturnType<typeof vi.fn>).mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('signIn stores credentials on a valid login response', async () => {
        fetchJsonMock.mockResolvedValueOnce(jsonResponse({
            token: 'tok-1', refresh_token: 'r-1',
        }));
        const { auth, store } = makeClient();

        await auth.signIn('a@b.com', 'pw');

        expect(auth.isAuthenticated()).toBe(true);
        expect(store.state.loggedIn).toBe(true);
        expect(localStorage.getItem('Cleanly.State')).not.toBeNull();
    });

    it('signIn throws on non-OK response', async () => {
        fetchJsonMock.mockResolvedValueOnce(jsonResponse({ message: 'bad creds' }, 401));
        const { auth } = makeClient();

        await expect(auth.signIn('a@b.com', 'pw')).rejects.toThrow();
        expect(auth.isAuthenticated()).toBe(false);
    });

    it('logout wipes credentials and store state', () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 't', refresh_token: 'r',
        }));
        const { auth, store, sse } = makeClient();
        auth.restoreState();
        expect(auth.isAuthenticated()).toBe(true);

        auth.logout();

        expect(auth.isAuthenticated()).toBe(false);
        expect(store.state.loggedIn).toBe(false);
        expect(localStorage.getItem('Cleanly.State')).toBeNull();
        expect(sse.close).toHaveBeenCalled();
    });

    it('restoreState ignores garbage in storage', () => {
        localStorage.setItem('Cleanly.State', '{"not":"valid"}');
        const { auth } = makeClient();
        auth.restoreState();
        expect(auth.isAuthenticated()).toBe(false);
    });

    it('requestImmediately refreshes the token on 401 and retries', async () => {
        // Seed a logged-in client.
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'old-tok', refresh_token: 'r-1',
        }));
        const { auth } = makeClient();
        auth.restoreState();

        fetchMock
            .mockResolvedValueOnce(jsonResponse({}, 401))                            // first attempt
            .mockResolvedValueOnce(jsonResponse({}, 401))                            // isSessionValid()
            .mockResolvedValueOnce(jsonResponse({ token: 'new-tok' }, 200))          // refreshLogin()
            .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));                 // retried original

        const response = await auth.requestImmediately('GET', 'api/things');

        expect(response.status).toBe(200);
        // The retry must use the *new* token.
        const lastCall = fetchMock.mock.calls.at(-1)!;
        expect(lastCall[3]).toMatchObject({ Authorization: 'Bearer new-tok' });
    });

    it('requestImmediately throws and clears session when refresh also fails', async () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'old-tok', refresh_token: 'r-1',
        }));
        const { auth, store } = makeClient();
        auth.restoreState();

        fetchMock
            .mockResolvedValueOnce(jsonResponse({}, 401)) // original
            .mockResolvedValueOnce(jsonResponse({}, 401)) // isSessionValid
            .mockResolvedValueOnce(jsonResponse({}, 401)); // refreshLogin

        await expect(auth.requestImmediately('GET', 'api/things')).rejects.toThrow(/Session/i);
        expect(localStorage.getItem('Cleanly.State')).toBeNull();
        expect(store.state.loggedIn).toBe(false);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(router.replace).toHaveBeenCalledWith('/');
    });

    it('requestEventually persists the queue when retry strategy is RETRY_AND_PERSIST', async () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'tok', refresh_token: 'r',
        }));
        const { auth } = makeClient();
        auth.restoreState();

        fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }, 200));

        const response = await auth.requestEventually(
            'POST', 'api/x', '{"a":1}', { 'Content-Type': 'application/json' },
            RetryStrategy.RETRY_AND_PERSIST,
        );

        expect(response.status).toBe(200);
        // After the request drained, the persisted queue is empty (saved a second time after success).
        const stored = localStorage.getItem('Cleanly.RequestQueue');
        expect(stored).toBe('[]');
    });

    it('requestEventually with RETRY-only strategy does not touch storage', async () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'tok', refresh_token: 'r',
        }));
        const { auth } = makeClient();
        auth.restoreState();

        fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }, 200));

        await auth.requestEventually(
            'POST', 'api/x', '{"a":1}', undefined, RetryStrategy.RETRY,
        );
        expect(localStorage.getItem('Cleanly.RequestQueue')).toBeNull();
    });

    it('handleSessionExpired clears the persisted queue and logs out', async () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'tok', refresh_token: 'r',
        }));
        const { auth } = makeClient();
        auth.restoreState();
        // Simulate a previously-persisted queue entry (without re-triggering
        // iteration, which would race with handleSessionExpired's reset).
        localStorage.setItem('Cleanly.RequestQueue', JSON.stringify([
            { method: 'POST', url: 'api/x', body: 'b' },
        ]));

        await auth.handleSessionExpired();

        expect(localStorage.getItem('Cleanly.RequestQueue')).toBeNull();
        expect(auth.isAuthenticated()).toBe(false);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(router.replace).toHaveBeenCalledWith('/');
    });

    it('iterateQueue drains successive requests in FIFO order', async () => {
        localStorage.setItem('Cleanly.State', JSON.stringify({
            mail: 'a@b.com', token: 'tok', refresh_token: 'r',
        }));
        const { auth } = makeClient();
        auth.restoreState();

        const callbacks: number[] = [];
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ n: 1 }, 200))
            .mockResolvedValueOnce(jsonResponse({ n: 2 }, 200));

        const p1 = auth.requestEventually('POST', 'api/a', 'a');
        const p2 = auth.requestEventually('POST', 'api/b', 'b');

        const [r1, r2] = await Promise.all([p1, p2]);
        callbacks.push((await r1.json()).n, (await r2.json()).n);
        expect(callbacks).toEqual([1, 2]);
    });
});
