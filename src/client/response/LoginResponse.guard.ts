/*
 * Generated type guards for "LoginResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LoginResponse } from "./LoginResponse";

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

export function isLoginResponse(obj: unknown, argumentName: string = "loginResponse"): obj is LoginResponse {
    const typedObj = obj as LoginResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["token"] === "string", `${argumentName}["token"]`, "string", typedObj["token"])
    )
}
