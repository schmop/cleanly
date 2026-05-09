import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import debounce from '@/common/debounce';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('delays trailing call by `wait` ms when immediate=false', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 100, false);
        debounced();
        expect(spy).not.toHaveBeenCalled();
        vi.advanceTimersByTime(99);
        expect(spy).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('coalesces rapid calls into one trailing invocation', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 50, false);
        debounced();
        debounced();
        debounced();
        vi.advanceTimersByTime(50);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('fires leading call immediately when immediate=true', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 100, true);
        debounced();
        expect(spy).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(100);
        // No trailing call when there were no extra calls in the window.
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('with immediate=true fires once at the start and once after extra calls', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 100, true);
        debounced();
        debounced();
        debounced();
        // Leading call has fired exactly once.
        expect(spy).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(100);
        // Trailing call fires because there were extra calls during the window.
        expect(spy).toHaveBeenCalledTimes(2);
    });
});
