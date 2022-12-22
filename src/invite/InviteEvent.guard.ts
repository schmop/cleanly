/*
 * Generated type guards for "InviteEvent.ts".
 * WARNING: Do not manually change this file.
 */
import { isInvite } from "../models/Invite.guard";
import { InviteEvent } from "./InviteEvent";

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

export function isInviteEvent(obj: unknown, argumentName: string = "inviteEvent"): obj is InviteEvent {
    const typedObj = obj as InviteEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(isInvite(typedObj["invite"]) as boolean, `${argumentName}["invite"]`, "import(\"C:/Users/schmop/Desktop/cleanly/src/models/Invite\").Invite", typedObj["invite"])
    )
}
