/*
 * Generated type guards for "Invite.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { Invite } from "./Invite";

export function isInvite(obj: unknown): obj is Invite {
    const typedObj = obj as Invite
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["householdId"] === "number" &&
        typeof typedObj["householdName"] === "string" &&
        (typedObj["inviter"] === null ||
            isUser(typedObj["inviter"]) as boolean)
    )
}
