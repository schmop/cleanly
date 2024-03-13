/*
 * Generated type guards for "TaskLog.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isTask } from "./Task.guard";
import { TaskLog } from "./TaskLog";

export function isTaskLog(obj: unknown): obj is TaskLog {
    const typedObj = obj as TaskLog
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        (typeof typedObj["user"] === "undefined" ||
            isUser(typedObj["user"]) as boolean) &&
        isTask(typedObj["task"]) as boolean &&
        typeof typedObj["timestamp"] === "number" &&
        typeof typedObj["stars"] === "number"
    )
}
