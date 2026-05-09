import { describe, expect, it } from 'vitest';
import {
    buildReminderPayload,
    defaultReminderFormState,
    isDayOfWeekSet,
    monthlyWeekdayShortLabel,
    reminderIntervalLabel,
    reminderToFormState,
    toggleDayOfWeek,
} from '@/common/reminder';

describe('isDayOfWeekSet / toggleDayOfWeek', () => {
    it('represents Monday as bit 0', () => {
        expect(isDayOfWeekSet(0b0000001, 1)).toBe(true);
        expect(isDayOfWeekSet(0b0000001, 2)).toBe(false);
    });

    it('represents Sunday (dow=0) as bit 6', () => {
        expect(isDayOfWeekSet(0b1000000, 0)).toBe(true);
    });

    it('toggleDayOfWeek flips the corresponding bit', () => {
        const monday = 1 << 0;
        // Tuesday (dow=2) is bit 1.
        expect(toggleDayOfWeek(monday, 2)).toBe(monday | 0b10);
        expect(toggleDayOfWeek(monday | 0b10, 2)).toBe(monday);
    });

    it('refuses to clear the last selected day', () => {
        const onlyMonday = 1 << 0;
        // Toggling Monday off would empty the mask; the helper preserves it.
        expect(toggleDayOfWeek(onlyMonday, 1)).toBe(onlyMonday);
    });
});

describe('reminderToFormState round-trips through buildReminderPayload', () => {
    it('handles weekly reminders', () => {
        const payload = { type: 'weekly' as const, interval: 2, daysOfWeek: 0b0010110, time: '08:30' };
        const state = reminderToFormState(payload);
        expect(state.unit).toBe('weeks');
        expect(state.daysOfWeek).toBe(payload.daysOfWeek);
        expect(buildReminderPayload(state)).toEqual(payload);
    });

    it('handles monthly_day reminders', () => {
        const payload = { type: 'monthly_day' as const, interval: 1, monthDay: 15, time: '09:00' };
        expect(buildReminderPayload(reminderToFormState(payload))).toEqual(payload);
    });

    it('handles monthly_weekday reminders', () => {
        const payload = {
            type: 'monthly_weekday' as const,
            interval: 1,
            weekOccurrence: -1,
            weekDay: 5,
            time: '12:00',
        };
        expect(buildReminderPayload(reminderToFormState(payload))).toEqual(payload);
    });

    it('handles yearly reminders (year is irrelevant)', () => {
        const payload = { type: 'yearly' as const, interval: 1, month: 6, day: 24, time: '07:15' };
        const state = reminderToFormState(payload);
        expect(state.unit).toBe('years');
        expect(buildReminderPayload(state)).toEqual(payload);
    });

    it('handles daily reminders', () => {
        const payload = { type: 'daily' as const, interval: 3, time: '20:00' };
        expect(buildReminderPayload(reminderToFormState(payload))).toEqual(payload);
    });
});

describe('buildReminderPayload', () => {
    it('returns null when disabled', () => {
        const state = defaultReminderFormState();
        expect(state.enabled).toBe(false);
        expect(buildReminderPayload(state)).toBeNull();
    });

    it('forces at least Monday for weekly reminders with empty mask', () => {
        const state = { ...defaultReminderFormState(), enabled: true, unit: 'weeks' as const, daysOfWeek: 0 };
        const payload = buildReminderPayload(state);
        expect(payload).toEqual(expect.objectContaining({ type: 'weekly', daysOfWeek: 1 << 0 }));
    });
});

describe('label helpers', () => {
    it('reminderIntervalLabel respects enabled', () => {
        expect(reminderIntervalLabel(false, 1, 'days')).toBe('No reminder');
        expect(reminderIntervalLabel(true, 2, 'days')).toBe('Remind me every 2 days');
    });

    it('monthlyWeekdayShortLabel resolves occurrence + weekday', () => {
        expect(monthlyWeekdayShortLabel(1, 1)).toBe('1st Mon');
        expect(monthlyWeekdayShortLabel(-1, 5)).toBe('last Fri');
    });
});
