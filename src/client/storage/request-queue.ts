import { HttpMethod, RequestBody } from "@/client/request";
import { makeQueueStringifyable, parseQueue } from "@/client/serialize/serialize-request-queue";
import { isSerializableRequestQueue } from "@/client/storage/request-queue.guard";
import { warning } from "@/toast";

const LOCALSTORAGE_REQUEST_QUEUE_KEY = 'Cleanly.RequestQueue';

/** @see {isSerializableRequest} ts-auto-guard:type-guard */
export interface SerializableRequest {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    body?: string|Record<string, string>;
}

/** @see {isPersistableRequest} ts-auto-guard:type-guard */

export interface PersistableRequest {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    body?: RequestBody;
}

export interface RetryableRequest extends PersistableRequest {
    shouldPersist: boolean;
    callback?: (response: Response) => void;
}

export type RequestQueue = RetryableRequest[];

/** @see {isSerializableRequestQueue} ts-auto-guard:type-guard */
export type SerializableRequestQueue = SerializableRequest[];

export function getRequestQueueFromStorage(): RequestQueue {
    const requestQueueString = localStorage.getItem(LOCALSTORAGE_REQUEST_QUEUE_KEY);
    if (null === requestQueueString) {
        console.warn('No cached request queue found.');

        return [];
    }
    const cachedQueue: unknown = JSON.parse(requestQueueString);
    if (!isSerializableRequestQueue(cachedQueue)) {
        void warning('Invalid format in request queue cache found.');
        localStorage.removeItem(LOCALSTORAGE_REQUEST_QUEUE_KEY);

        return [];
    }

    return parseQueue(cachedQueue);
}


export function saveRequestQueueToStorage(requestQueue: RequestQueue) {
    localStorage.setItem(
        LOCALSTORAGE_REQUEST_QUEUE_KEY,
        JSON.stringify(makeQueueStringifyable(requestQueue))
    );
}

export function clearRequestQueueFromStorage() {
    localStorage.removeItem(LOCALSTORAGE_REQUEST_QUEUE_KEY);
}
