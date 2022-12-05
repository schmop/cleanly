/*
 * Generated type guards for "UserSettings.ts".
 * WARNING: Do not manually change this file.
 */
import { UserSettings } from "./UserSettings";

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

export function isUserSettings(obj: unknown, argumentName: string = "userSettings"): obj is UserSettings {
    const typedObj = obj as UserSettings
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["notifyTaskDone"] === "boolean", `${argumentName}["notifyTaskDone"]`, "boolean", typedObj["notifyTaskDone"]) &&
        evaluate(typeof typedObj["notifyTaskDue"] === "boolean", `${argumentName}["notifyTaskDue"]`, "boolean", typedObj["notifyTaskDue"]) &&
        evaluate(typeof typedObj["notifyInvites"] === "boolean", `${argumentName}["notifyInvites"]`, "boolean", typedObj["notifyInvites"]) &&
        evaluate(typeof typedObj["language"] === "string", `${argumentName}["language"]`, "string", typedObj["language"])
    )
}
