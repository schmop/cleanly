/*
 * Generated type guards for "TaskLog.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isTask } from "./Task.guard";
import { TaskLog } from "./TaskLog";

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

export function isTaskLog(obj: unknown, argumentName: string = "taskLog"): obj is TaskLog {
    const typedObj = obj as TaskLog
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["uuid"] === "string", `${argumentName}["uuid"]`, "string", typedObj["uuid"]) &&
        evaluate((typeof typedObj["user"] === "undefined" ||
            isUser(typedObj["user"]) as boolean), `${argumentName}["user"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/User\").User | undefined", typedObj["user"]) &&
        evaluate(isTask(typedObj["task"]) as boolean, `${argumentName}["task"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Task\").Task", typedObj["task"]) &&
        evaluate(typeof typedObj["timestamp"] === "number", `${argumentName}["timestamp"]`, "number", typedObj["timestamp"])
    )
}
