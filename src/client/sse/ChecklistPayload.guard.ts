/*
 * Generated type guards for "ChecklistPayload.ts".
 * WARNING: Do not manually change this file.
 */
import { isTodoEvent } from "../../models/TodoEvent.guard";
import { ChecklistPayload } from "./ChecklistPayload";

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

export function isChecklistPayload(obj: unknown, argumentName: string = "checklistPayload"): obj is ChecklistPayload {
    const typedObj = obj as ChecklistPayload
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(Array.isArray(typedObj["events"]) &&
            typedObj["events"].every((e: any) =>
                isTodoEvent(e) as boolean
            ), `${argumentName}["events"]`, "import(\"./src/models/TodoEvent\").TodoEvent[]", typedObj["events"]) &&
        evaluate(typeof typedObj["household_id"] === "number", `${argumentName}["household_id"]`, "number", typedObj["household_id"])
    )
}
