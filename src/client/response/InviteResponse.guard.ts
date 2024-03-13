/*
 * Generated type guards for "InviteResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { isHousehold } from "../../models/Household.guard";
import { InviteResponse } from "./InviteResponse";

export function isInviteResponse(obj: unknown): obj is InviteResponse {
    const typedObj = obj as InviteResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isHousehold(typedObj["household"]) as boolean
    )
}
