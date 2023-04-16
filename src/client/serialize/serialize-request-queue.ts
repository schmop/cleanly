import { formDataToSerializableObject, isFormData, objectToFormData } from "@/client/serialize/serialize-form-data";
import { RequestQueue, SerializableRequest, SerializableRequestQueue } from "@/client/storage/request-queue";


export function makeQueueStringifyable(queue: RequestQueue): SerializableRequestQueue {
    return queue
        .filter((request) => request.shouldPersist)
        .map((request) => {
            const body = isFormData(request.body)
                ? formDataToSerializableObject(request.body)
                : request.body;

            return {
                body,
                headers: request.headers,
                method: request.method,
                url: request.url,
            };
        });
}

export function parseQueue(queue: SerializableRequestQueue): RequestQueue {
    return queue
        .map((request: SerializableRequest) => {
            const body: string|FormData|undefined = typeof request.body === 'object'
                ? objectToFormData(request.body)
                : request.body;

            return {
                body,
                headers: request.headers,
                method: request.method,
                url: request.url,
                shouldPersist: true,
            };
        });
}
