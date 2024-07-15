/*
 * Generated type guards for "DashboardInfo.ts".
 * WARNING: Do not manually change this file.
 */
import { isUser } from "./User.guard";
import { isHousehold } from "./Household.guard";
import { isInvite } from "./Invite.guard";
import { isUserSettings } from "./UserSettings.guard";
import { DashboardInfo } from "./DashboardInfo";

export function isDashboardInfo(obj: unknown): obj is DashboardInfo {
    const typedObj = obj as DashboardInfo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isUser(typedObj["user"]) as boolean &&
        Array.isArray(typedObj["households"]) &&
        typedObj["households"].every((e: any) =>
            isHousehold(e) as boolean
        ) &&
        Array.isArray(typedObj["checklistSubscriptions"]) &&
        typedObj["checklistSubscriptions"].every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(typedObj["invites"]) &&
        typedObj["invites"].every((e: any) =>
            isInvite(e) as boolean
        ) &&
        isUserSettings(typedObj["settings"]) as boolean
    )
}
