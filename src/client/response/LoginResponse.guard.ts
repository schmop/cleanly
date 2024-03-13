/*
 * Generated type guards for "LoginResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LoginResponse } from "./LoginResponse";

export function isLoginResponse(obj: unknown): obj is LoginResponse {
    const typedObj = obj as LoginResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["token"] === "string"
    )
}
