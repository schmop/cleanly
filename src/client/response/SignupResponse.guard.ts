/*
 * Generated type guards for "SignupResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { SignupResponse, SignupSuccessResponse, SignupFailureResponse } from "./SignupResponse";

export function isSignupResponse(obj: unknown): obj is SignupResponse {
    const typedObj = obj as SignupResponse
    return (
        (isSignupSuccessResponse(typedObj) as boolean ||
            isSignupFailureResponse(typedObj) as boolean)
    )
}

export function isSignupSuccessResponse(obj: unknown): obj is SignupSuccessResponse {
    const typedObj = obj as SignupSuccessResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["status"] === "success" &&
        typeof typedObj["verification_required"] === "boolean"
    )
}

export function isSignupFailureResponse(obj: unknown): obj is SignupFailureResponse {
    const typedObj = obj as SignupFailureResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["status"] === "failure" &&
        (typeof typedObj["reason"] === "undefined" ||
            typeof typedObj["reason"] === "string")
    )
}
