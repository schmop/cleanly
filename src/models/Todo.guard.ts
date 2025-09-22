/*
 * Generated type guards for "Todo.ts".
 * WARNING: Do not manually change this file.
 */
import { Todo } from "./Todo";

export function isTodo(obj: unknown): obj is Todo {
    const typedObj = obj as Todo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        typeof typedObj["content"] === "string" &&
        (typedObj["checked_at"] === null ||
            typeof typedObj["checked_at"] === "number")
    )
}
