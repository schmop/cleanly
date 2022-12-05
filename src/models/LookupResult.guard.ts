/*
 * Generated type guards for "LookupResult.ts".
 * WARNING: Do not manually change this file.
 */
import { LookupResult } from "./LookupResult";

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

export function isLookupResult(obj: unknown, argumentName: string = "lookupResult"): obj is LookupResult {
    const typedObj = obj as LookupResult
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["id"] === "number", `${argumentName}["id"]`, "number", typedObj["id"]) &&
        evaluate(typeof typedObj["name"] === "string", `${argumentName}["name"]`, "string", typedObj["name"])
    )
}
