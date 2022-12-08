import { TaskLog } from '@/models/TaskLog';

/** @see {isRawTaskLog} ts-auto-guard:type-guard */
export interface RawTaskLog {
    uuid: string,
    user: number|undefined,
    task: number|undefined,
    timestamp: number, // unix timestamp in seconds
    stars: number,
}

/** @see {isRawTaskLogResponse} ts-auto-guard:type-guard */
export interface RawTaskLogResponse {
    logs: RawTaskLog[],
    upToId: string|null,
}

/** @see {isTaskLogResponse} ts-auto-guard:type-guard */
export interface TaskLogResponse {
    logs: TaskLog[],
    upToId: string|null,
}
