/*
 * Generated type guards for "AuthStorage.ts".
 * WARNING: Do not manually change this file.
 */
import { AuthStorage } from "./AuthStorage";

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

export function isAuthStorage(obj: unknown, argumentName: string = "authStorage"): obj is AuthStorage {
    const typedObj = obj as AuthStorage
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["mail"] === "string", `${argumentName}["mail"]`, "string", typedObj["mail"]) &&
        evaluate(typeof typedObj["token"] === "string", `${argumentName}["token"]`, "string", typedObj["token"]) &&
        evaluate(typeof typedObj["refresh_token"] === "string", `${argumentName}["refresh_token"]`, "string", typedObj["refresh_token"])
    )
}
