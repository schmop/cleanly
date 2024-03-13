/*
 * Generated type guards for "auth-storage.ts".
 * WARNING: Do not manually change this file.
 */
import { AuthStorage } from "./auth-storage";

export function isAuthStorage(obj: unknown): obj is AuthStorage {
    const typedObj = obj as AuthStorage
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["mail"] === "string" &&
        typeof typedObj["token"] === "string" &&
        typeof typedObj["refresh_token"] === "string"
    )
}
