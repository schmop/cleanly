import { vi } from 'vitest';

type FetchResponseInit = {
    status?: number;
    headers?: Record<string, string>;
    body: unknown;
};

// Wraps `globalThis.fetch` with a Vitest spy. Each call to `mockFetchOnce`
// queues one response; calls return queued responses in order.
const queue: FetchResponseInit[] = [];
let installed = false;

function ensureInstalled(): void {
    if (installed) return;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
        const next = queue.shift();
        if (!next) {
            return Promise.reject(new Error('mockFetch: no queued response for fetch call'));
        }
        const body = typeof next.body === 'string' ? next.body : JSON.stringify(next.body);
        return Promise.resolve(new Response(body, {
            status: next.status ?? 200,
            headers: next.headers ?? { 'Content-Type': 'application/json' },
        }));
    });
    installed = true;
}

export function mockFetchOnce(response: FetchResponseInit): void {
    ensureInstalled();
    queue.push(response);
}

export function resetFetchMock(): void {
    queue.length = 0;
}
