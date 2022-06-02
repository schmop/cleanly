import { _n, _t, __t, } from "@/translation";

export const DAY_IN_SECONDS = 60 * 60 * 24;
export const DAY_IN_HOURS = 24;
export const HOUR_IN_SECONDS = 60 * 60;

export function secondsSince(timestampInSeconds: number): number {
    return Date.now() / 1000 - timestampInSeconds;
}

export const DAY_FORMATTING_SIZES: { [durationName: string]: number } = {
    days: 1,
    months: 30,
    years: 365,
};

export const HOUR_FORMATTING_SIZES: { [durationName: string]: number } = {
    hours: 1,
    days: 24,
    months: 24 * 30,
    years: 24 * 365,
};

export const DURATION_SIZES: { [durationName: string]: number } = {
    days: 1,
    weeks: 7,
    months: 30,
    years: 365,
};

function pluralToSingular(timeName: string): string {
    // remove plural (s)
    // weeks -> week
    return timeName.slice(0, -1);
}

function formatInterval(someTime: number, someDurations: { [durationName: string]: number }, maxDepth = Infinity): string {
    let string = '';
    const sortedDurations = Object.entries(someDurations).sort(([, a], [, b]) => b - a);

    sortedDurations.forEach(([name, duration]) => {
        const num = Math.floor(someTime / duration);
        if (num > 0) {
            someTime = someTime % duration;

            string += `${num} ${_n(pluralToSingular(name), name, num)} `;
        }
    });

    if ('' === string) {
        const smallestDurationName = sortedDurations[sortedDurations.length - 1][0];

        return `0 ${_t(smallestDurationName)}`;
    }

    return string;
}

export function formatHours(hours: number, maxDepth = 2): string {
    return formatInterval(hours, HOUR_FORMATTING_SIZES, maxDepth);
}

export function formatDays(days: number, maxDepth = 3): string {
    return formatInterval(days, DAY_FORMATTING_SIZES, maxDepth);
}

export function roundedRecurringInterval(days: number): string {
    if (days <= 1) {
        return _t('everyday');
    }

    const sortedDurations = Object.entries(DURATION_SIZES).sort(([, a], [, b]) => b - a);

    for (const [name, duration] of sortedDurations) {
        const num = Math.floor(days / duration);
        const rest = days % duration;
        if (num > 0 && rest === 0) {
            if (num === 1) {
                return _t(`every ${pluralToSingular(name)}`);
            }

            return __t(`every {0} ${name}`, num);
        }
    }

    return _t('never');
}