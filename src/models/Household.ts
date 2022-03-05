import {User} from "@/models/User";
import {Task} from "@/models/Task";

export interface Household {
    id: number,
    name: string,
    color: string,
    users: User[],
    tasks: Task[],
    picture?: string | null,
    admin?: string | null,
}