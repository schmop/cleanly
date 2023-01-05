/*
 * Generated type guards for "LookupUserResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LookupUserResponse } from "./LookupUserResponse";

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

export function isLookupUserResponse(obj: unknown, argumentName: string = "lookupUserResponse"): obj is LookupUserResponse {
    const typedObj = obj as LookupUserResponse
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any, i0: number) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            evaluate(typeof e["id"] === "number", `${argumentName}[${i0}]["id"]`, "number", e["id"]) &&
            evaluate(typeof e["name"] === "string", `${argumentName}[${i0}]["name"]`, "string", e["name"])
        )
    )
}
