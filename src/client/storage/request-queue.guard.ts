/*
 * Generated type guards for "request-queue.ts".
 * WARNING: Do not manually change this file.
 */
import { PersistableRequest, SerializableRequest, SerializableRequestQueue } from "./request-queue";

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

export function isPersistableRequest(obj: unknown, argumentName: string = "persistableRequest"): obj is PersistableRequest {
    const typedObj = obj as PersistableRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate((typedObj["method"] === "GET" ||
            typedObj["method"] === "POST" ||
            typedObj["method"] === "PUT" ||
            typedObj["method"] === "DELETE" ||
            typedObj["method"] === "PATCH" ||
            typedObj["method"] === "HEAD" ||
            typedObj["method"] === "OPTIONS" ||
            typedObj["method"] === "CONNECT" ||
            typedObj["method"] === "TRACE"), `${argumentName}["method"]`, "import(\"./src/client/request\").HttpMethod", typedObj["method"]) &&
        evaluate(typeof typedObj["url"] === "string", `${argumentName}["url"]`, "string", typedObj["url"]) &&
        evaluate((typeof typedObj["headers"] === "undefined" ||
            (typedObj["headers"] !== null &&
                typeof typedObj["headers"] === "object" ||
                typeof typedObj["headers"] === "function") &&
            Object.entries<any>(typedObj["headers"])
                .every(([key, value]) => (evaluate(typeof value === "string", `${argumentName}["headers"]["${key.toString().replace(/"/g, '\\"')}"]`, "string", value) &&
                    evaluate(typeof key === "string", `${argumentName}["headers"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key)))), `${argumentName}["headers"]`, "Record<string, string> | undefined", typedObj["headers"]) &&
        evaluate((typeof typedObj["body"] === "undefined" ||
            typeof typedObj["body"] === "string" ||
            typedObj["body"] instanceof FormData), `${argumentName}["body"]`, "string | FormData | undefined", typedObj["body"])
    )
}

export function isSerializableRequest(obj: unknown, argumentName: string = "serializableRequest"): obj is SerializableRequest {
    const typedObj = obj as SerializableRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        evaluate((typedObj["method"] === "GET" ||
            typedObj["method"] === "POST" ||
            typedObj["method"] === "PUT" ||
            typedObj["method"] === "DELETE" ||
            typedObj["method"] === "PATCH" ||
            typedObj["method"] === "HEAD" ||
            typedObj["method"] === "OPTIONS" ||
            typedObj["method"] === "CONNECT" ||
            typedObj["method"] === "TRACE"), `${argumentName}["method"]`, "import(\"./src/client/request\").HttpMethod", typedObj["method"]) &&
        evaluate(typeof typedObj["url"] === "string", `${argumentName}["url"]`, "string", typedObj["url"]) &&
        evaluate((typeof typedObj["headers"] === "undefined" ||
            (typedObj["headers"] !== null &&
                typeof typedObj["headers"] === "object" ||
                typeof typedObj["headers"] === "function") &&
            Object.entries<any>(typedObj["headers"])
                .every(([key, value]) => (evaluate(typeof value === "string", `${argumentName}["headers"]["${key.toString().replace(/"/g, '\\"')}"]`, "string", value) &&
                    evaluate(typeof key === "string", `${argumentName}["headers"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key)))), `${argumentName}["headers"]`, "Record<string, string> | undefined", typedObj["headers"]) &&
        evaluate((typeof typedObj["body"] === "undefined" ||
            typeof typedObj["body"] === "string" ||
            (typedObj["body"] !== null &&
                typeof typedObj["body"] === "object" ||
                typeof typedObj["body"] === "function") &&
            Object.entries<any>(typedObj["body"])
                .every(([key, value]) => (evaluate(typeof value === "string", `${argumentName}["body"]["${key.toString().replace(/"/g, '\\"')}"]`, "string", value) &&
                    evaluate(typeof key === "string", `${argumentName}["body"] (key: "${key.toString().replace(/"/g, '\\"')}")`, "string", key)))), `${argumentName}["body"]`, "string | Record<string, string> | undefined", typedObj["body"])
    )
}

export function isSerializableRequestQueue(obj: unknown, argumentName: string = "serializableRequestQueue"): obj is SerializableRequestQueue {
    const typedObj = obj as SerializableRequestQueue
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any) =>
            isSerializableRequest(e) as boolean
        )
    )
}
