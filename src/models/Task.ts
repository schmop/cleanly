import {User} from "@/models/User";

export interface Task {
    name: string,
    uuid: string,
    icon: string,
    color: string,
    lastComplete?: Date | null,
    duration: number,
    assignedTo: User,
}