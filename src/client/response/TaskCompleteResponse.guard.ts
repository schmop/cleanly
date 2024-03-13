/*
 * Generated type guards for "TaskCompleteResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "../../models/User.guard";
import { TaskCompleteResponse } from "./TaskCompleteResponse";

export function isTaskCompleteResponse(obj: unknown): obj is TaskCompleteResponse {
    const typedObj = obj as TaskCompleteResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["timestamp"] === "number" &&
        (typedObj["assignee"] === null ||
            isUser(typedObj["assignee"]) as boolean)
    )
}
