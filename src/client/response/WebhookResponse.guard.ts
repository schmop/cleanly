/*
 * Generated type guards for "WebhookResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { WebhookResponse } from "./WebhookResponse";

function evaluate(
    isCorrect: boolean,
    varName: string,
    expected: string,
    actual: any
): boolean {
    if (!isCorrect) {
        console.error(
            `${varName} type mismatch, expected: ${expected}, found:`,
            actual
        )
    }
    return isCorrect
}

export function isWebhookResponse(obj: unknown, argumentName: string = "webhookResponse"): obj is WebhookResponse {
    const typedObj = obj as WebhookResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate(typeof typedObj["secret"] === "string", `${argumentName}["secret"]`, "string", typedObj["secret"])
    )
}
