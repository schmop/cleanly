import { User } from "@/models/User";
import { Task } from "./Task";

/** @see {isTaskLog} ts-auto-guard:type-guard */
export type TaskLog = {
    uuid: string,
    user: User|undefined,
    task: Task,
    timestamp: number, // unix timestamp in seconds
    stars: number,
}
