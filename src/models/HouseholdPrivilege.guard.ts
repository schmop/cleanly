/*
 * Generated type guards for "HouseholdPrivilege.ts".
 * WARNING: Do not manually change this file.
 */
import { PrivilegeLevel, HouseholdPrivilege } from "./HouseholdPrivilege";

export function isHouseholdPrivilege(obj: unknown): obj is HouseholdPrivilege {
    const typedObj = obj as HouseholdPrivilege
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["user"] === "number" &&
        typeof typedObj["household"] === "number" &&
        (typedObj["privilege"] === PrivilegeLevel.USER ||
            typedObj["privilege"] === PrivilegeLevel.MODERATOR ||
            typedObj["privilege"] === PrivilegeLevel.ADMIN)
    )
}
