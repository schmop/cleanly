/*
 * Generated type guards for "ErrorResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { ErrorResponse } from "./ErrorResponse";

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

export function isErrorResponse(obj: unknown, argumentName: string = "errorResponse"): obj is ErrorResponse {
    const typedObj = obj as ErrorResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["reason"] === "string", `${argumentName}["reason"]`, "string", typedObj["reason"])
    )
}
