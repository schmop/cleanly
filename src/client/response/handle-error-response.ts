import { isErrorResponse } from "@/client/response/ErrorResponse.guard";

export async function handleErrorResponse(response: Response, context: string) {
    let reason = null;
    try {
        const data: unknown = await response.json();
        if (isErrorResponse(data)) {
            reason = data.reason;
        }
    } catch (_err: any) {
        /** Ignore errors parsing invalid JSON */
    }
    if (typeof reason !== 'string') {
        throw new Error(`Error ${context}, server responded with ${response.statusText}`);
    }
    throw new Error(`Error ${context}: ${reason}`);
}
