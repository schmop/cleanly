/*
 * Generated type guards for "LoginRefreshResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LoginRefreshResponse } from "./LoginRefreshResponse";

export function isLoginRefreshResponse(obj: unknown): obj is LoginRefreshResponse {
    const typedObj = obj as LoginRefreshResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["token"] === "string"
    )
}
