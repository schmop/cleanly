import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { HouseholdPrivilege } from './HouseholdPrivilege';
import { Todo } from "./Todo";

export type Checklist = {
    name: string,
    uuid: string,
    checklist: Todo[],
    rank: string,
};

/** @see {isHousehold} ts-auto-guard:type-guard */
export interface Household {
    id: number,
    name: string,
    users: User[],
    tasks: Task[],
    webhookUrl: string|null,
    privileges: HouseholdPrivilege[],
    checklists: Checklist[],
    reassignmentStrategy: string,
}
