/*
 * Generated type guards for "User.ts".
 * WARNING: Do not manually change this file.
 */
import { User } from "./User";

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

export function isUser(obj: unknown, argumentName: string = "user"): obj is User {
    const typedObj = obj as User
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["id"] === "number", `${argumentName}["id"]`, "number", typedObj["id"]) &&
        evaluate(typeof typedObj["name"] === "string", `${argumentName}["name"]`, "string", typedObj["name"]) &&
        evaluate((typeof typedObj["mail"] === "undefined" ||
            typedObj["mail"] === null ||
            typeof typedObj["mail"] === "string"), `${argumentName}["mail"]`, "string | null | undefined", typedObj["mail"])
    )
}
