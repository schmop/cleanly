/*
 * Generated type guards for "LoginRefreshResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LoginRefreshResponse } from "./LoginRefreshResponse";

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

export function isLoginRefreshResponse(obj: unknown, argumentName: string = "loginRefreshResponse"): obj is LoginRefreshResponse {
    const typedObj = obj as LoginRefreshResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["token"] === "string", `${argumentName}["token"]`, "string", typedObj["token"])
    )
}
