/*
 * Generated type guards for "WebhookResponse.ts".
 * WARNING: Do not manually change this file.
 */
import { WebhookResponse } from "./WebhookResponse";

export function isWebhookResponse(obj: unknown): obj is WebhookResponse {
    const typedObj = obj as WebhookResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["secret"] === "string"
    )
}
