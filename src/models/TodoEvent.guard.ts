/*
 * Generated type guards for "TodoEvent.ts".
 * WARNING: Do not manually change this file.
 */
import { TodoEvent } from "./TodoEvent";

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

export function isTodoEvent(obj: unknown, argumentName: string = "todoEvent"): obj is TodoEvent {
    const typedObj = obj as TodoEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["uuid"] === "string", `${argumentName}["uuid"]`, "string", typedObj["uuid"]) &&
        evaluate((typedObj["type"] === "sort" ||
            typedObj["type"] === "delete" ||
            typedObj["type"] === "update" ||
            typedObj["type"] === "create"), `${argumentName}["type"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/TodoEvent\").TodoEventType", typedObj["type"]) &&
        evaluate((typeof typedObj["data"] === "undefined" ||
            typeof typedObj["data"] === "string"), `${argumentName}["data"]`, "string | undefined", typedObj["data"])
    )
}
