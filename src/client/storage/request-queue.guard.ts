/*
 * Generated type guards for "request-queue.ts".
 * WARNING: Do not manually change this file.
 */
import { SerializableRequest, PersistableRequest, SerializableRequestQueue } from "./request-queue";

export function isSerializableRequest(obj: unknown): obj is SerializableRequest {
    const typedObj = obj as SerializableRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["method"] === "GET" ||
            typedObj["method"] === "POST" ||
            typedObj["method"] === "PUT" ||
            typedObj["method"] === "DELETE" ||
            typedObj["method"] === "PATCH" ||
            typedObj["method"] === "HEAD" ||
            typedObj["method"] === "OPTIONS" ||
            typedObj["method"] === "CONNECT" ||
            typedObj["method"] === "TRACE") &&
        typeof typedObj["url"] === "string" &&
        (typeof typedObj["headers"] === "undefined" ||
            (typedObj["headers"] !== null &&
                typeof typedObj["headers"] === "object" ||
                typeof typedObj["headers"] === "function") &&
            Object.entries<any>(typedObj["headers"])
                .every(([key, value]) => (typeof value === "string" &&
                    typeof key === "string"))) &&
        (typeof typedObj["body"] === "undefined" ||
            typeof typedObj["body"] === "string" ||
            (typedObj["body"] !== null &&
                typeof typedObj["body"] === "object" ||
                typeof typedObj["body"] === "function") &&
            Object.entries<any>(typedObj["body"])
                .every(([key, value]) => (typeof value === "string" &&
                    typeof key === "string")))
    )
}

export function isPersistableRequest(obj: unknown): obj is PersistableRequest {
    const typedObj = obj as PersistableRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["method"] === "GET" ||
            typedObj["method"] === "POST" ||
            typedObj["method"] === "PUT" ||
            typedObj["method"] === "DELETE" ||
            typedObj["method"] === "PATCH" ||
            typedObj["method"] === "HEAD" ||
            typedObj["method"] === "OPTIONS" ||
            typedObj["method"] === "CONNECT" ||
            typedObj["method"] === "TRACE") &&
        typeof typedObj["url"] === "string" &&
        (typeof typedObj["headers"] === "undefined" ||
            (typedObj["headers"] !== null &&
                typeof typedObj["headers"] === "object" ||
                typeof typedObj["headers"] === "function") &&
            Object.entries<any>(typedObj["headers"])
                .every(([key, value]) => (typeof value === "string" &&
                    typeof key === "string"))) &&
        (typeof typedObj["body"] === "undefined" ||
            typeof typedObj["body"] === "string" ||
            typedObj["body"] instanceof FormData)
    )
}

export function isSerializableRequestQueue(obj: unknown): obj is SerializableRequestQueue {
    const typedObj = obj as SerializableRequestQueue
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any) =>
            isSerializableRequest(e) as boolean
        )
    )
}
