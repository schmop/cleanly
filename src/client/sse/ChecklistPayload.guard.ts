/*
 * Generated type guards for "ChecklistPayload.ts".
 * WARNING: Do not manually change this file.
 */
import { isTodoEvent } from "../../models/TodoEvent.guard";
import { ChecklistPayload } from "./ChecklistPayload";

export function isChecklistPayload(obj: unknown): obj is ChecklistPayload {
    const typedObj = obj as ChecklistPayload
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["events"]) &&
        typedObj["events"].every((e: any) =>
            isTodoEvent(e) as boolean
        ) &&
        typeof typedObj["checklist_uuid"] === "string"
    )
}
