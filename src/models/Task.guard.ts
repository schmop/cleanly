/*
 * Generated type guards for "Task.ts".
 * WARNING: Do not manually change this file.
 */
import { TaskReminderDaily, TaskReminderWeekly, TaskReminderMonthlyDay, TaskReminderMonthlyWeekday, TaskReminderYearly, TaskReminder, Task } from "./Task";

export function isTaskReminderDaily(obj: unknown): obj is TaskReminderDaily {
    const typedObj = obj as TaskReminderDaily
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "daily" &&
        typeof typedObj["interval"] === "number" &&
        typeof typedObj["time"] === "string"
    )
}

export function isTaskReminderWeekly(obj: unknown): obj is TaskReminderWeekly {
    const typedObj = obj as TaskReminderWeekly
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "weekly" &&
        typeof typedObj["interval"] === "number" &&
        typeof typedObj["daysOfWeek"] === "number" &&
        typeof typedObj["time"] === "string"
    )
}

export function isTaskReminderMonthlyDay(obj: unknown): obj is TaskReminderMonthlyDay {
    const typedObj = obj as TaskReminderMonthlyDay
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "monthly_day" &&
        typeof typedObj["interval"] === "number" &&
        typeof typedObj["monthDay"] === "number" &&
        typeof typedObj["time"] === "string"
    )
}

export function isTaskReminderMonthlyWeekday(obj: unknown): obj is TaskReminderMonthlyWeekday {
    const typedObj = obj as TaskReminderMonthlyWeekday
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "monthly_weekday" &&
        typeof typedObj["interval"] === "number" &&
        typeof typedObj["weekOccurrence"] === "number" &&
        typeof typedObj["weekDay"] === "number" &&
        typeof typedObj["time"] === "string"
    )
}

export function isTaskReminderYearly(obj: unknown): obj is TaskReminderYearly {
    const typedObj = obj as TaskReminderYearly
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "yearly" &&
        typeof typedObj["interval"] === "number" &&
        typeof typedObj["month"] === "number" &&
        typeof typedObj["day"] === "number" &&
        typeof typedObj["time"] === "string"
    )
}

export function isTaskReminder(obj: unknown): obj is TaskReminder {
    const typedObj = obj as TaskReminder
    return (
        (isTaskReminderDaily(typedObj) as boolean ||
            isTaskReminderWeekly(typedObj) as boolean ||
            isTaskReminderMonthlyDay(typedObj) as boolean ||
            isTaskReminderMonthlyWeekday(typedObj) as boolean ||
            isTaskReminderYearly(typedObj) as boolean)
    )
}

export function isTask(obj: unknown): obj is Task {
    const typedObj = obj as Task
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["icon"] === "string" &&
        (typedObj["hue"] === null ||
            typeof typedObj["hue"] === "number") &&
        (typeof typedObj["lastComplete"] === "undefined" ||
            typedObj["lastComplete"] === null ||
            typeof typedObj["lastComplete"] === "number") &&
        (typedObj["duration"] === null ||
            typeof typedObj["duration"] === "number") &&
        (typedObj["assignee"] === null ||
            typeof typedObj["assignee"] === "number") &&
        typeof typedObj["stars"] === "number" &&
        (typedObj["reminder"] === null ||
            isTaskReminderDaily(typedObj["reminder"]) as boolean ||
            isTaskReminderWeekly(typedObj["reminder"]) as boolean ||
            isTaskReminderMonthlyDay(typedObj["reminder"]) as boolean ||
            isTaskReminderMonthlyWeekday(typedObj["reminder"]) as boolean ||
            isTaskReminderYearly(typedObj["reminder"]) as boolean)
    )
}
