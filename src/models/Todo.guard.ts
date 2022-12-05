/*
 * Generated type guards for "Todo.ts".
 * WARNING: Do not manually change this file.
 */
import { Todo } from "./Todo";

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

export function isTodo(obj: unknown, argumentName: string = "todo"): obj is Todo {
    const typedObj = obj as Todo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["uuid"] === "string", `${argumentName}["uuid"]`, "string", typedObj["uuid"]) &&
        evaluate(typeof typedObj["content"] === "string", `${argumentName}["content"]`, "string", typedObj["content"])
    )
}
