import { User } from "@/models/User";

/** @see {isTaskCompleteResponse} ts-auto-guard:type-guard */
export interface TaskCompleteResponse {
    timestamp: number,
    assignee: User|null,
}
