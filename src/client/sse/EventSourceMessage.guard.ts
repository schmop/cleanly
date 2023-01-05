/*
 * Generated type guards for "EventSourceMessage.ts".
 * WARNING: Do not manually change this file.
 */
import { EventSourceMessage } from "./EventSourceMessage";

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

export function isEventSourceMessage(obj: unknown, argumentName: string = "eventSourceMessage"): obj is EventSourceMessage {
    const typedObj = obj as EventSourceMessage
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["type"] === "string", `${argumentName}["type"]`, "string", typedObj["type"])
    )
}
