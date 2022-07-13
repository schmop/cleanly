import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { Todo } from "./Todo";

export interface Household {
    id: number,
    name: string,
    color: string,
    users: User[],
    tasks: Task[],
    picture?: string | null,
    admin?: number | null,
    checklist: Todo[],
}