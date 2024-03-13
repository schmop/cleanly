/*
 * Generated type guards for "TaskLogResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { RawTaskLog, RawTaskLogResponse, TaskLogResponse } from "./TaskLogResponse";
import { isTaskLog } from "../../models/TaskLog.guard";

export function isRawTaskLog(obj: unknown): obj is RawTaskLog {
    const typedObj = obj as RawTaskLog
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["uuid"] === "string" &&
        (typeof typedObj["user"] === "undefined" ||
            typeof typedObj["user"] === "number") &&
        (typeof typedObj["task"] === "undefined" ||
            typeof typedObj["task"] === "number") &&
        typeof typedObj["timestamp"] === "number" &&
        typeof typedObj["stars"] === "number"
    )
}

export function isRawTaskLogResponse(obj: unknown): obj is RawTaskLogResponse {
    const typedObj = obj as RawTaskLogResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["logs"]) &&
        typedObj["logs"].every((e: any) =>
            isRawTaskLog(e) as boolean
        ) &&
        (typedObj["upToId"] === null ||
            typeof typedObj["upToId"] === "string")
    )
}

export function isTaskLogResponse(obj: unknown): obj is TaskLogResponse {
    const typedObj = obj as TaskLogResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["logs"]) &&
        typedObj["logs"].every((e: any) =>
            isTaskLog(e) as boolean
        ) &&
        (typedObj["upToId"] === null ||
            typeof typedObj["upToId"] === "string")
    )
}
