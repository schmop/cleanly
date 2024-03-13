/*
 * Generated type guards for "StarResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { StarResponse } from "./StarResponse";

export function isStarResponse(obj: unknown): obj is StarResponse {
    const typedObj = obj as StarResponse
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["user"] === "number" &&
            typeof e["stars"] === "number"
        )
    )
}
