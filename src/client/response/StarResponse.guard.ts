/*
 * Generated type guards for "StarResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { StarResponse } from "./StarResponse";

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

export function isStarResponse(obj: unknown, argumentName: string = "starResponse"): obj is StarResponse {
    const typedObj = obj as StarResponse
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any, i0: number) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            evaluate(typeof e["user"] === "number", `${argumentName}[${i0}]["user"]`, "number", e["user"]) &&
            evaluate(typeof e["stars"] === "number", `${argumentName}[${i0}]["stars"]`, "number", e["stars"])
        )
    )
}
