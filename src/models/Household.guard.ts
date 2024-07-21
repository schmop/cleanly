/*
 * Generated type guards for "Household.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isTask } from "./Task.guard";
import { isHouseholdPrivilege } from "./HouseholdPrivilege.guard";
import { isTodo } from "./Todo.guard";
import { Household } from "./Household";

export function isHousehold(obj: unknown): obj is Household {
    const typedObj = obj as Household
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["name"] === "string" &&
        Array.isArray(typedObj["users"]) &&
        typedObj["users"].every((e: any) =>
            isUser(e) as boolean
        ) &&
        Array.isArray(typedObj["tasks"]) &&
        typedObj["tasks"].every((e: any) =>
            isTask(e) as boolean
        ) &&
        (typedObj["webhookUrl"] === null ||
            typeof typedObj["webhookUrl"] === "string") &&
        Array.isArray(typedObj["privileges"]) &&
        typedObj["privileges"].every((e: any) =>
            isHouseholdPrivilege(e) as boolean
        ) &&
        Array.isArray(typedObj["checklists"]) &&
        typedObj["checklists"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["name"] === "string" &&
            typeof e["uuid"] === "string" &&
            Array.isArray(e["checklist"]) &&
            e["checklist"].every((e: any) =>
                isTodo(e) as boolean
            ) &&
            typeof e["rank"] === "string"
        ) &&
        typeof typedObj["reassignmentStrategy"] === "string"
    )
}
