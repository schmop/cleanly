/*
 * Generated type guards for "Invite.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { Invite } from "./Invite";

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

export function isInvite(obj: unknown, argumentName: string = "invite"): obj is Invite {
    const typedObj = obj as Invite
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["householdId"] === "number", `${argumentName}["householdId"]`, "number", typedObj["householdId"]) &&
        evaluate(typeof typedObj["householdName"] === "string", `${argumentName}["householdName"]`, "string", typedObj["householdName"]) &&
        evaluate((typedObj["inviter"] === null ||
            isUser(typedObj["inviter"]) as boolean), `${argumentName}["inviter"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/User\").User | null", typedObj["inviter"])
    )
}
