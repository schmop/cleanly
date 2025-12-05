import { HeadersData, HttpMethod, JsonData, RequestBody } from "@/client/request";
import { store } from "@/store";

export async function fetchImmediately(
    method: HttpMethod,
    url: string,
    body?: RequestBody,
    headers?: HeadersData,
): Promise<Response> {
    return await fetch(`${store.state.serverUrl}/${url}`, {
        method,
        headers,
        body,
    });
}

export async function fetchJsonImmediately(
    method: HttpMethod,
    url: string,
    data: JsonData,
    headers: HeadersData = {},
): Promise<Response> {
    headers['Content-Type'] = 'application/json';

    return await fetchImmediately(
        method,
        url,
        JSON.stringify(data),
        headers,
    );
}
