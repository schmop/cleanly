import { Invite } from "@/models/Invite";

/** @see {isInviteEvent} ts-auto-guard:type-guard */
export interface InviteEvent {
    invite: Invite,
}