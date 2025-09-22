/*
 * Generated type guards for "TodoEvent.ts".
 * WARNING: Do not manually change this file.
 */
import { TodoEvent } from "./TodoEvent";

export function isTodoEvent(obj: unknown): obj is TodoEvent {
    const typedObj = obj as TodoEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        typeof typedObj["checklistUuid"] === "string" &&
        (typedObj["type"] === "sort" ||
            typedObj["type"] === "check" ||
            typedObj["type"] === "update" ||
            typedObj["type"] === "create" ||
            typedObj["type"] === "delete") &&
        (typedObj["data"] === null ||
            typeof typedObj["data"] === "string")
    )
}
