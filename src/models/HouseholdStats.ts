import { JsonRecord, TaskId, UserId } from '@/types/index';

export type UserParticipations = JsonRecord<UserId, number>;

/** @see {isHouseholdStats} ts-auto-guard:type-guard */
export interface HouseholdStats {
    durations: JsonRecord<TaskId, TaskStats>;
    userParticipations: JsonRecord<TaskId, UserParticipations>;
}

/** @see {isTaskStats} ts-auto-guard:type-guard */
export interface TaskStats {
    average: number|null;
    min: number|null;
    max: number|null;
    num: number;
}