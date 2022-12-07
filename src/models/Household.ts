import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { Todo } from "./Todo";
import { HouseholdPrivilege } from './HouseholdPrivilege';

/** @see {isHousehold} ts-auto-guard:type-guard */
export interface Household {
    id: number,
    name: string,
    users: User[],
    tasks: Task[],
    picture?: string | null,
    privileges: HouseholdPrivilege[],
    checklist: Todo[],
}
