import { UserId } from "@/types";

/** @see {isTaskReminderDaily} ts-auto-guard:type-guard */
export type TaskReminderDaily = {
    type: 'daily',
    interval: number,
    time: string,        // HH:MM
}

/** @see {isTaskReminderWeekly} ts-auto-guard:type-guard */
export type TaskReminderWeekly = {
    type: 'weekly',
    interval: number,
    daysOfWeek: number,  // bitmask: bit 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun (range 1..127)
    time: string,
}

/** @see {isTaskReminderMonthlyDay} ts-auto-guard:type-guard */
export type TaskReminderMonthlyDay = {
    type: 'monthly_day',
    interval: number,
    monthDay: number,    // 1–31
    time: string,
}

/** @see {isTaskReminderMonthlyWeekday} ts-auto-guard:type-guard */
export type TaskReminderMonthlyWeekday = {
    type: 'monthly_weekday',
    interval: number,
    weekOccurrence: number,  // -1=last, 1–4
    weekDay: number,          // 0=Sun … 6=Sat
    time: string,
}

/** @see {isTaskReminderYearly} ts-auto-guard:type-guard */
export type TaskReminderYearly = {
    type: 'yearly',
    interval: number,
    month: number,  // 1–12
    day: number,    // 1–31
    time: string,
}

/** @see {isTaskReminder} ts-auto-guard:type-guard */
export type TaskReminder =
    | TaskReminderDaily
    | TaskReminderWeekly
    | TaskReminderMonthlyDay
    | TaskReminderMonthlyWeekday
    | TaskReminderYearly

/** @see {isTask} ts-auto-guard:type-guard */
export type Task = {
    name: string,
    id: number,
    icon: string,
    hue: number|null,
    lastComplete?: number|null, // unix timestamp in seconds
    duration: number|null, // in hours, null if it has no due date
    assignee: UserId|null,
    stars: number,
    reminder: TaskReminder|null,
}
