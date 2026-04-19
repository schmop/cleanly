/*
 * Generated type guards for "Household.ts".
 * WARNING: Do not manually change this file.
 */
import { isTodo } from "./Todo.guard";
import { Checklist, Household } from "./Household";
import { isUser } from "./User.guard";
import { isTask } from "./Task.guard";
import { isHouseholdPrivilege } from "./HouseholdPrivilege.guard";

export function isChecklist(obj: unknown): obj is Checklist {
    const typedObj = obj as Checklist
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        typeof typedObj["uuid"] === "string" &&
        Array.isArray(typedObj["checklist"]) &&
        typedObj["checklist"].every((e: any) =>
            isTodo(e) as boolean
        ) &&
        typeof typedObj["rank"] === "string"
    )
}

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
            isChecklist(e) as boolean
        ) &&
        typeof typedObj["reassignmentStrategy"] === "string"
    )
}
