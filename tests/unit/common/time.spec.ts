import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    DAY_IN_HOURS,
    DAY_IN_SECONDS,
    HOUR_IN_SECONDS,
    exactRecurringInterval,
    secondsSince,
    secondsToDays,
    secondsToHours,
} from '@/common/time';

describe('time constants', () => {
    it('match real-world definitions', () => {
        expect(HOUR_IN_SECONDS).toBe(3600);
        expect(DAY_IN_SECONDS).toBe(86400);
        expect(DAY_IN_HOURS).toBe(24);
    });
});

describe('secondsSince', () => {
    beforeEach(() => {
        vi.useFakeTimers().setSystemTime(1_000_000);
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns elapsed seconds since a past timestamp', () => {
        // Date.now() === 1_000_000 ms === 1000 s.
        expect(secondsSince(900)).toBe(100);
    });

    it('returns negative for future timestamps', () => {
        expect(secondsSince(1500)).toBe(-500);
    });
});

describe('secondsToDays / secondsToHours', () => {
    it('floors towards zero on whole multiples', () => {
        expect(secondsToDays(DAY_IN_SECONDS)).toBe(1);
        expect(secondsToHours(HOUR_IN_SECONDS * 3)).toBe(3);
    });
    it('floors away fractional remainders', () => {
        expect(secondsToDays(DAY_IN_SECONDS + 5)).toBe(1);
        expect(secondsToHours(HOUR_IN_SECONDS - 1)).toBe(0);
    });
});

describe('exactRecurringInterval', () => {
    it('expresses 24h as 1 day', () => {
        expect(exactRecurringInterval(24)).toEqual({ times: 1, format: 'days' });
    });
    it('expresses 168h as 1 week', () => {
        expect(exactRecurringInterval(168)).toEqual({ times: 1, format: 'weeks' });
    });
    it('expresses 720h as 1 month (30d)', () => {
        expect(exactRecurringInterval(720)).toEqual({ times: 1, format: 'months' });
    });
    it('falls back to hours when no larger unit divides evenly', () => {
        expect(exactRecurringInterval(5)).toEqual({ times: 5, format: 'hours' });
        expect(exactRecurringInterval(25)).toEqual({ times: 25, format: 'hours' });
    });
});
