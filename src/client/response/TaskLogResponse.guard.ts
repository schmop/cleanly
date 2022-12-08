/*
 * Generated type guards for "TaskLogResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { RawTaskLog, RawTaskLogResponse, TaskLogResponse } from "./TaskLogResponse";
import { isTaskLog } from "../../models/TaskLog.guard";

function evaluate(
    isCorrect: boolean,
    varName: string,
    expected: string,
    actual: any
): boolean {
    if (!isCorrect) {
        console.error(
            `${varName} type mismatch, expected: ${expected}, found:`,
            actual
        )
    }
    return isCorrect
}

export function isRawTaskLog(obj: unknown, argumentName: string = "rawTaskLog"): obj is RawTaskLog {
    const typedObj = obj as RawTaskLog
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["uuid"] === "string", `${argumentName}["uuid"]`, "string", typedObj["uuid"]) &&
        evaluate((typeof typedObj["user"] === "undefined" ||
            typeof typedObj["user"] === "number"), `${argumentName}["user"]`, "number | undefined", typedObj["user"]) &&
        evaluate((typeof typedObj["task"] === "undefined" ||
            typeof typedObj["task"] === "number"), `${argumentName}["task"]`, "number | undefined", typedObj["task"]) &&
        evaluate(typeof typedObj["timestamp"] === "number", `${argumentName}["timestamp"]`, "number", typedObj["timestamp"]) &&
        evaluate(typeof typedObj["stars"] === "number", `${argumentName}["stars"]`, "number", typedObj["stars"])
    )
}

export function isRawTaskLogResponse(obj: unknown, argumentName: string = "rawTaskLogResponse"): obj is RawTaskLogResponse {
    const typedObj = obj as RawTaskLogResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(Array.isArray(typedObj["logs"]) &&
            typedObj["logs"].every((e: any) =>
                isRawTaskLog(e) as boolean
            ), `${argumentName}["logs"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/client/response/TaskLogResponse\").RawTaskLog[]", typedObj["logs"]) &&
        evaluate((typedObj["upToId"] === null ||
            typeof typedObj["upToId"] === "string"), `${argumentName}["upToId"]`, "string | null", typedObj["upToId"])
    )
}

export function isTaskLogResponse(obj: unknown, argumentName: string = "taskLogResponse"): obj is TaskLogResponse {
    const typedObj = obj as TaskLogResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(Array.isArray(typedObj["logs"]) &&
            typedObj["logs"].every((e: any) =>
                isTaskLog(e) as boolean
            ), `${argumentName}["logs"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/TaskLog\").TaskLog[]", typedObj["logs"]) &&
        evaluate((typedObj["upToId"] === null ||
            typeof typedObj["upToId"] === "string"), `${argumentName}["upToId"]`, "string | null", typedObj["upToId"])
    )
}
