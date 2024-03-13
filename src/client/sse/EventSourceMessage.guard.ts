/*
 * Generated type guards for "EventSourceMessage.ts".
 * WARNING: Do not manually change this file.
 */
import { EventSourceMessage } from "./EventSourceMessage";

export function isEventSourceMessage(obj: unknown): obj is EventSourceMessage {
    const typedObj = obj as EventSourceMessage
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["type"] === "string"
    )
}
