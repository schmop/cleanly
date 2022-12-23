import {User} from "@/models/User";

/** @see {isTask} ts-auto-guard:type-guard */
export interface Task {
    name: string,
    id: number,
    icon: string,
    color: string|null,
    lastComplete?: number|null, // unix timestamp in seconds
    duration: number|null, // in days, null if it has no due date
    assignedTo?: User,
    stars: number,
}