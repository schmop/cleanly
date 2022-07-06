import { Task } from "@/models/Task";
import { DAY_IN_SECONDS, secondsSince } from "./time";

export function taskSortByPriority(a: Task, b: Task): number {
    return Math.sign(secondsLeft(a) - secondsLeft(b));
}

export function secondsLeft(t: Task) {
    if (t.lastComplete == null) {
        return 0;
    }

    return t.duration * DAY_IN_SECONDS - secondsSince(t.lastComplete);
}

export function taskProgress(t: Task): number {
    const duration = t.duration * DAY_IN_SECONDS;
    if (!t.lastComplete) {
        return 0;
    }
    const timeSinceLastComplete = secondsSince(t.lastComplete);

    return Math.max(0, duration - timeSinceLastComplete) / duration;
}

export function taskOverDue(task: Task): boolean {
    if (!task.lastComplete) {
        return false;
    }
    const sinceDays = secondsSince(task.lastComplete) / DAY_IN_SECONDS;

    return sinceDays >= task.duration;
}