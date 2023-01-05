/*
 * Generated type guards for "TaskCompleteResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { TaskCompleteResponse } from "./TaskCompleteResponse";

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

export function isTaskCompleteResponse(obj: unknown, argumentName: string = "taskCompleteResponse"): obj is TaskCompleteResponse {
    const typedObj = obj as TaskCompleteResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["timestamp"] === "number", `${argumentName}["timestamp"]`, "number", typedObj["timestamp"])
    )
}
