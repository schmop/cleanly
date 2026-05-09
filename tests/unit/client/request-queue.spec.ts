import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/toast', () => ({
    warning: vi.fn(),
    error: vi.fn(),
}));

import {
    clearRequestQueueFromStorage,
    getRequestQueueFromStorage,
    saveRequestQueueToStorage,
    type RequestQueue,
} from '@/client/storage/request-queue';

const STORAGE_KEY = 'Cleanly.RequestQueue';

describe('request-queue storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns empty queue when nothing is cached', () => {
        expect(getRequestQueueFromStorage()).toEqual([]);
    });

    it('round-trips a persistable string-body request', () => {
        const queue: RequestQueue = [{
            method: 'POST',
            url: 'api/foo',
            body: '{"hello":"world"}',
            headers: { 'Content-Type': 'application/json' },
            shouldPersist: true,
        }];

        saveRequestQueueToStorage(queue);
        const restored = getRequestQueueFromStorage();

        expect(restored).toHaveLength(1);
        const r = restored[0]!;
        expect(r.method).toBe('POST');
        expect(r.url).toBe('api/foo');
        expect(r.body).toBe('{"hello":"world"}');
        expect(r.shouldPersist).toBe(true);
    });

    it('round-trips a FormData body via the serializable-object encoding', () => {
        const formData = new FormData();
        formData.append('a', '1');
        formData.append('b', 'two');

        saveRequestQueueToStorage([{
            method: 'POST',
            url: 'api/upload',
            body: formData,
            shouldPersist: true,
        }]);

        const restored = getRequestQueueFromStorage();
        expect(restored).toHaveLength(1);
        const restoredBody = restored[0]!.body;
        expect(restoredBody).toBeInstanceOf(FormData);
        if (restoredBody instanceof FormData) {
            expect(restoredBody.get('a')).toBe('1');
            expect(restoredBody.get('b')).toBe('two');
        }
    });

    it('drops non-persistable requests when serializing', () => {
        saveRequestQueueToStorage([
            { method: 'POST', url: 'a', shouldPersist: true,  body: 'keep' },
            { method: 'POST', url: 'b', shouldPersist: false, body: 'drop' },
            { method: 'POST', url: 'c', shouldPersist: true,  body: 'keep2' },
        ]);

        const restored = getRequestQueueFromStorage();
        expect(restored.map(r => r.url)).toEqual(['a', 'c']);
    });

    it('strips non-string FormData entries (file uploads cannot be persisted)', () => {
        const formData = new FormData();
        formData.append('text', 'plain');
        formData.append('file', new Blob(['data']), 'file.txt');

        saveRequestQueueToStorage([{
            method: 'POST', url: 'api/upload', body: formData, shouldPersist: true,
        }]);

        const restored = getRequestQueueFromStorage();
        const body = restored[0]!.body;
        expect(body).toBeInstanceOf(FormData);
        if (body instanceof FormData) {
            expect(body.get('text')).toBe('plain');
            expect(body.get('file')).toBeNull();
        }
    });

    it('discards malformed cache and returns empty queue', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
        expect(getRequestQueueFromStorage()).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('discards cache that fails the type guard (e.g. missing required fields)', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([{ url: 'no-method' }]));
        expect(getRequestQueueFromStorage()).toEqual([]);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('clears the cached queue', () => {
        saveRequestQueueToStorage([{
            method: 'POST', url: 'api/x', body: 'y', shouldPersist: true,
        }]);
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
        clearRequestQueueFromStorage();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('marks restored requests as persistable so they survive subsequent saves', () => {
        saveRequestQueueToStorage([{
            method: 'POST', url: 'api/a', body: 'b', shouldPersist: true,
        }]);
        const restored = getRequestQueueFromStorage();
        expect(restored[0]!.shouldPersist).toBe(true);

        saveRequestQueueToStorage(restored);
        expect(getRequestQueueFromStorage()).toHaveLength(1);
    });
});
