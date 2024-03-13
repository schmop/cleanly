/*
 * Generated type guards for "InviteEvent.ts".
 * WARNING: Do not manually change this file.
 */
import { isInvite } from "../models/Invite.guard";
import { InviteEvent } from "./InviteEvent";

export function isInviteEvent(obj: unknown): obj is InviteEvent {
    const typedObj = obj as InviteEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isInvite(typedObj["invite"]) as boolean
    )
}
