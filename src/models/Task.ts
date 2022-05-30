import {User} from "@/models/User";

export interface Task {
    name: string,
    id: string,
    icon: string,
    color: string,
    lastComplete?: number | null, // unix timestamp
    duration: number, // in days
    assignedTo: User,
}