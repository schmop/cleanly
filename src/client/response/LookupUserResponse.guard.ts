/*
 * Generated type guards for "LookupUserResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { LookupUserResponse } from "./LookupUserResponse";

export function isLookupUserResponse(obj: unknown): obj is LookupUserResponse {
    const typedObj = obj as LookupUserResponse
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["id"] === "number" &&
            typeof e["name"] === "string"
        )
    )
}
