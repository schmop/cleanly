import {User} from "@/models/User";

/** @see {isTask} ts-auto-guard:type-guard */
export interface Task {
    name: string,
    id: number,
    icon: string,
    color?: string,
    lastComplete?: number | null, // unix timestamp in seconds
    duration: number, // in days
    assignedTo?: User,
    stars: number,
}