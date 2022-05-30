import { Task } from "@/models/Task";
import { DAY_IN_SECONDS, secondsSince } from "./time";

export function taskSortByPriority(a: Task, b: Task): number {
    if (a.lastComplete != null && b.lastComplete != null) {
        const aPercent = secondsSince(a.lastComplete) / a.duration;
        const bPercent = secondsSince(b.lastComplete) / b.duration;

        return bPercent - aPercent;
    }
    if (a.lastComplete == null && b.lastComplete != null) {
        return 1;
    }
    if (a.lastComplete != null && b.lastComplete == null) {
        return -1;
    }

    return 0;
}

export function taskProgress(t: Task): number {
    const duration = t.duration * DAY_IN_SECONDS;
    if (!t.lastComplete) {
        return 0;
    }
    const timeSinceLastComplete = secondsSince(t.lastComplete);

    return Math.max(0, duration - timeSinceLastComplete) / duration;
}