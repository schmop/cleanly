import { Task } from "@/models/Task";
import { DAY_IN_SECONDS, secondsSince } from "./time";

export function taskSortByPriority(a: Task, b: Task): number {
    return Math.sign(secondsLeft(a) - secondsLeft(b));
}

export function secondsLeft(t: Task) {
    if (null == t.lastComplete) {
        return 0;
    }

    if (null === t.duration) {
        return -secondsSince(t.lastComplete);
    }

    return t.duration * DAY_IN_SECONDS - secondsSince(t.lastComplete);
}

export function taskProgress(t: Task): number {
    if (null == t.lastComplete || null === t.duration) {
        return 0;
    }
    const duration = t.duration * DAY_IN_SECONDS;
    const timeSinceLastComplete = secondsSince(t.lastComplete);

    return Math.max(0, duration - timeSinceLastComplete) / duration;
}

export function taskOverDue(task: Task): boolean {
    if (null == task.lastComplete || null === task.duration) {
        return false;
    }
    const sinceDays = secondsSince(task.lastComplete) / DAY_IN_SECONDS;

    return sinceDays >= task.duration;
}