/*
 * Generated type guards for "ErrorResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { ErrorResponse } from "./ErrorResponse";

export function isErrorResponse(obj: unknown): obj is ErrorResponse {
    const typedObj = obj as ErrorResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["reason"] === "string"
    )
}
