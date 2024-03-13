/*
 * Generated type guards for "User.ts".
 * WARNING: Do not manually change this file.
 */
import { User } from "./User";

export function isUser(obj: unknown): obj is User {
    const typedObj = obj as User
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["name"] === "string" &&
        (typeof typedObj["mail"] === "undefined" ||
            typedObj["mail"] === null ||
            typeof typedObj["mail"] === "string")
    )
}
