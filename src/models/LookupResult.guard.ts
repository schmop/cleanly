/*
 * Generated type guards for "LookupResult.ts".
 * WARNING: Do not manually change this file.
 */
import { LookupResult } from "./LookupResult";

export function isLookupResult(obj: unknown): obj is LookupResult {
    const typedObj = obj as LookupResult
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["name"] === "string"
    )
}
