import { Task } from "@/models/Task";
import { HOUR_IN_SECONDS, secondsSince } from "./time";

export function taskSortByPriority(a: Task, b: Task): number {
    if (null == a.lastComplete && null == b.lastComplete) {
        return 0;
    }

    if (null == a.lastComplete && null === b.duration) {
        return -1;
    }

    if (null == b.lastComplete && null === a.duration) {
        return 1;
    }

    if (taskOverDue(a) && !taskOverDue(b)) {
        return -1;
    }

    if (!taskOverDue(a) && taskOverDue(b)) {
        return 1;
    }

    return Math.sign(secondsLeft(a) - secondsLeft(b));
}

export function secondsLeft(t: Task) {
    if (null == t.lastComplete) {
        return 0;
    }

    if (null === t.duration) {
        return -secondsSince(t.lastComplete);
    }

    return t.duration * HOUR_IN_SECONDS - secondsSince(t.lastComplete);
}

export function taskProgress(t: Task): number {
    if (null == t.lastComplete || null === t.duration) {
        return 0;
    }
    const duration = t.duration * HOUR_IN_SECONDS;
    const timeSinceLastComplete = secondsSince(t.lastComplete);

    return Math.max(0, duration - timeSinceLastComplete) / duration;
}

export function taskOverDue(task: Task): boolean {
    if (null == task.lastComplete || null === task.duration) {
        return false;
    }
    const sinceHours = secondsSince(task.lastComplete) / HOUR_IN_SECONDS;

    return sinceHours >= task.duration;
}