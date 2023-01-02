/*
 * Generated type guards for "Task.ts".
 * WARNING: Do not manually change this file.
 */
import { Task } from "./Task";

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

export function isTask(obj: unknown, argumentName: string = "task"): obj is Task {
    const typedObj = obj as Task
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["name"] === "string", `${argumentName}["name"]`, "string", typedObj["name"]) &&
        evaluate(typeof typedObj["id"] === "number", `${argumentName}["id"]`, "number", typedObj["id"]) &&
        evaluate(typeof typedObj["icon"] === "string", `${argumentName}["icon"]`, "string", typedObj["icon"]) &&
        evaluate((typedObj["hue"] === null ||
            typeof typedObj["hue"] === "number"), `${argumentName}["hue"]`, "number | null", typedObj["hue"]) &&
        evaluate((typeof typedObj["lastComplete"] === "undefined" ||
            typedObj["lastComplete"] === null ||
            typeof typedObj["lastComplete"] === "number"), `${argumentName}["lastComplete"]`, "number | null | undefined", typedObj["lastComplete"]) &&
        evaluate((typedObj["duration"] === null ||
            typeof typedObj["duration"] === "number"), `${argumentName}["duration"]`, "number | null", typedObj["duration"]) &&
        evaluate((typedObj["assignee"] === null ||
            typeof typedObj["assignee"] === "number"), `${argumentName}["assignee"]`, "number | null", typedObj["assignee"]) &&
        evaluate(typeof typedObj["stars"] === "number", `${argumentName}["stars"]`, "number", typedObj["stars"])
    )
}
