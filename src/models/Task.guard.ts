/*
 * Generated type guards for "Task.ts".
 * WARNING: Do not manually change this file.
 */
import { Task } from "./Task";

export function isTask(obj: unknown): obj is Task {
    const typedObj = obj as Task
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["icon"] === "string" &&
        (typedObj["hue"] === null ||
            typeof typedObj["hue"] === "number") &&
        (typeof typedObj["lastComplete"] === "undefined" ||
            typedObj["lastComplete"] === null ||
            typeof typedObj["lastComplete"] === "number") &&
        (typedObj["duration"] === null ||
            typeof typedObj["duration"] === "number") &&
        (typedObj["assignee"] === null ||
            typeof typedObj["assignee"] === "number") &&
        typeof typedObj["stars"] === "number"
    )
}
