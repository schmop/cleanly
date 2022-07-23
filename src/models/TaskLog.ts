import {User} from "@/models/User";
import { Task } from "./Task";

export interface TaskLog {
    uuid: string,
    user: User,
    task: Task,
    timestamp: number, // unix timestamp in seconds
}