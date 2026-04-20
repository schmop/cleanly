import { TaskReminder } from '@/models/Task';
import { __t, _t } from '@/translation';

export type ReminderUnit = 'days' | 'weeks' | 'months' | 'years';
export type MonthlyType = 'day' | 'weekday';

export type ReminderFormState = {
    enabled: boolean,
    interval: number,
    unit: ReminderUnit,
    time: string,

    // Weekly — bitmask: bit 0=Mon, 1=Tue … 5=Sat, 6=Sun. Range 1..127.
    daysOfWeek: number,

    // Monthly
    monthlyType: MonthlyType,
    monthDay: number,
    weekOccurrence: number,
    weekDay: number,

    // Yearly: HTML date input (YYYY-MM-DD). The year is irrelevant; only
    // month+day are written back to the payload.
    yearDate: string,
};

// Convert the 0=Sun..6=Sat day-of-week number used by DOW_OPTIONS (JS Date
// convention) to the bit position (0=Mon..6=Sun). Bit position doubles as the
// day offset from Monday, which matches the week layout.
function dowToBit(dow: number): number {
    return dow === 0 ? 6 : dow - 1;
}

export function isDayOfWeekSet(mask: number, dow: number): boolean {
    return (mask & (1 << dowToBit(dow))) !== 0;
}

export const DOW_OPTIONS = [
    { value: 1, key: 'Monday',    shortKey: 'Mon' },
    { value: 2, key: 'Tuesday',   shortKey: 'Tue' },
    { value: 3, key: 'Wednesday', shortKey: 'Wed' },
    { value: 4, key: 'Thursday',  shortKey: 'Thu' },
    { value: 5, key: 'Friday',    shortKey: 'Fri' },
    { value: 6, key: 'Saturday',  shortKey: 'Sat' },
    { value: 0, key: 'Sunday',    shortKey: 'Sun' },
] as const;

export const WEEK_OCCURRENCE_OPTIONS = [
    { value:  1, key: '1st' },
    { value:  2, key: '2nd' },
    { value:  3, key: '3rd' },
    { value:  4, key: '4th' },
    { value: -1, key: 'last' },
    { value: -2, key: '2nd last' },
    { value: -3, key: '3rd last' },
    { value: -4, key: '4th last' },
] as const;

export function defaultReminderFormState(): ReminderFormState {
    return {
        enabled: false,
        interval: 1,
        unit: 'weeks',
        time: '22:00',
        daysOfWeek: 1 << 0,  // Monday
        monthlyType: 'day',
        monthDay: 1,
        weekOccurrence: 1,
        weekDay: 1,
        yearDate: `${new Date().getFullYear()}-01-01`,
    };
}

export function reminderToFormState(reminder: TaskReminder): ReminderFormState {
    const state = defaultReminderFormState();
    state.enabled = true;
    state.interval = reminder.interval;
    state.time = reminder.time;

    switch (reminder.type) {
        case 'daily':
            state.unit = 'days';
            break;
        case 'weekly':
            state.unit = 'weeks';
            state.daysOfWeek = reminder.daysOfWeek;
            break;
        case 'monthly_day':
            state.unit = 'months';
            state.monthlyType = 'day';
            state.monthDay = reminder.monthDay;
            break;
        case 'monthly_weekday':
            state.unit = 'months';
            state.monthlyType = 'weekday';
            state.weekOccurrence = reminder.weekOccurrence;
            state.weekDay = reminder.weekDay;
            break;
        case 'yearly':
            state.unit = 'years';
            state.yearDate = `${new Date().getFullYear()}-${pad2(reminder.month)}-${pad2(reminder.day)}`;
            break;
    }
    return state;
}

export function buildReminderPayload(state: ReminderFormState): TaskReminder | null {
    if (!state.enabled) {
        return null;
    }
    const { interval, time } = state;
    switch (state.unit) {
        case 'days':
            return { type: 'daily', interval, time };
        case 'weeks':
            return {
                type: 'weekly',
                interval,
                daysOfWeek: state.daysOfWeek !== 0 ? state.daysOfWeek : (1 << 0),
                time,
            };
        case 'months':
            if (state.monthlyType === 'day') {
                return { type: 'monthly_day', interval, monthDay: state.monthDay, time };
            }
            return {
                type: 'monthly_weekday',
                interval,
                weekOccurrence: state.weekOccurrence,
                weekDay: state.weekDay,
                time,
            };
        case 'years':
            return {
                type: 'yearly',
                interval,
                month: parseYearDatePart(state.yearDate, 1),
                day: parseYearDatePart(state.yearDate, 2),
                time,
            };
    }
}

export function toggleDayOfWeek(mask: number, dow: number): number {
    const next = mask ^ (1 << dowToBit(dow));
    // Can't clear all days — keep the last selected one.
    return next === 0 ? mask : next;
}

export function reminderIntervalLabel(enabled: boolean, interval: number, unit: ReminderUnit): string {
    if (!enabled) {
        return _t('No reminder');
    }
    return __t('Remind me every {0} {1}', interval, _t(unit));
}

export function monthlyWeekdayShortLabel(weekOccurrence: number, weekDay: number): string {
    const occ = WEEK_OCCURRENCE_OPTIONS.find(o => o.value === weekOccurrence);
    const day = DOW_OPTIONS.find(d => d.value === weekDay);
    return `${occLabel(occ?.key ?? '1st')} ${dowShortLabel(day?.shortKey ?? 'Mon')}`;
}

// Switch resolvers below: the translation checker scans _t() call sites for
// literal string arguments. Passing a dynamic key would be invisible to it,
// so we expand the finite `as const` union into explicit literal calls.

function occLabel(key: typeof WEEK_OCCURRENCE_OPTIONS[number]['key']): string {
    switch (key) {
        case '1st':      return _t('1st');
        case '2nd':      return _t('2nd');
        case '3rd':      return _t('3rd');
        case '4th':      return _t('4th');
        case 'last':     return _t('last');
        case '2nd last': return _t('2nd last');
        case '3rd last': return _t('3rd last');
        case '4th last': return _t('4th last');
    }
}

function dowShortLabel(key: typeof DOW_OPTIONS[number]['shortKey']): string {
    switch (key) {
        case 'Mon': return _t('Mon');
        case 'Tue': return _t('Tue');
        case 'Wed': return _t('Wed');
        case 'Thu': return _t('Thu');
        case 'Fri': return _t('Fri');
        case 'Sat': return _t('Sat');
        case 'Sun': return _t('Sun');
    }
}

function parseYearDatePart(yearDate: string, index: 1 | 2): number {
    const part = parseInt(yearDate.split('-')[index] ?? '1');
    return isNaN(part) ? 1 : part;
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}
