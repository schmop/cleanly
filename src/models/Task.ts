import { UserId } from "@/types";

/** @see {isTask} ts-auto-guard:type-guard */
export interface Task {
    name: string,
    id: number,
    icon: string,
    hue: number|null,
    lastComplete?: number|null, // unix timestamp in seconds
    duration: number|null, // in days, null if it has no due date
    assignee: UserId|null,
    stars: number,
}
