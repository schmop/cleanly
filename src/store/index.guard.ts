/*
 * Generated type guards for "index.ts".
 * WARNING: Do not manually change this file.
 */
import { isHousehold } from "../models/Household.guard";
import { isUser } from "../models/User.guard";
import { isInvite } from "../models/Invite.guard";
import { isUserSettings } from "../models/UserSettings.guard";
import { StateInterface } from "./index";

export function isState(obj: unknown): obj is StateInterface {
    const typedObj = obj as StateInterface
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["loggedIn"] === "boolean" &&
        Array.isArray(typedObj["households"]) &&
        typedObj["households"].every((e: any) =>
            isHousehold(e) as boolean
        ) &&
        (typedObj["user"] === null ||
            isUser(typedObj["user"]) as boolean) &&
        Array.isArray(typedObj["checklistSubscriptions"]) &&
        typedObj["checklistSubscriptions"].every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(typedObj["invites"]) &&
        typedObj["invites"].every((e: any) =>
            isInvite(e) as boolean
        ) &&
        (typedObj["pageTitle"] === null ||
            typeof typedObj["pageTitle"] === "string") &&
        (typedObj["viewedHousehold"] === null ||
            typeof typedObj["viewedHousehold"] === "number") &&
        (typedObj["openChecklist"] === null ||
            typeof typedObj["openChecklist"] === "string") &&
        isUserSettings(typedObj["userSettings"]) as boolean &&
        (typedObj["stars"] !== null &&
            typeof typedObj["stars"] === "object" ||
            typeof typedObj["stars"] === "function") &&
        Object.entries<any>(typedObj["stars"])
            .every(([key, value]) => ((value !== null &&
                typeof value === "object" ||
                typeof value === "function") &&
                Object.entries<any>(value)
                    .every(([key, value]) => (typeof value === "number" &&
                        (+key).toString() === key)) &&
                (+key).toString() === key)) &&
        typeof typedObj["darkmode"] === "boolean"
    )
}
