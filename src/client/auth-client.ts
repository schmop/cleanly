import { getWebHost } from '@/client/host';
import { HeadersData, HTTP_OK, HTTP_UNAUTHORIZED, HttpMethod, JsonData, RequestBody } from "@/client/request";
import { handleErrorResponse } from "@/client/response/handle-error-response";
import { isLoginRefreshResponse } from "@/client/response/LoginRefreshResponse.guard";
import { isLoginResponse } from "@/client/response/LoginResponse.guard";
import { isLookupUserResponse } from "@/client/response/LookupUserResponse.guard";
import { SseClient } from "@/client/sse-client";
import {
    AuthStorage,
    clearAuthFromStorage,
    getAuthFromStorage,
    saveAuthToStorage
} from "@/client/storage/auth-storage";
import { isAuthStorage } from "@/client/storage/auth-storage.guard";
import {
    clearRequestQueueFromStorage,
    getRequestQueueFromStorage,
    RequestQueue,
    saveRequestQueueToStorage
} from "@/client/storage/request-queue";
import { sleep } from "@/common/sleep";
import { PushService } from '@/push';
import router from '@/router';
import { localstore, Store } from '@/store';
import { error } from "@/toast";

export enum RetryStrategy {
    RETRY,
    RETRY_AND_PERSIST,
}

export class AuthClient {
    private authStorage: AuthStorage|null = null;
    private requestQueue: RequestQueue = [];
    private iteratingQueuePromise: Promise<void>|null = null;

    constructor(private store: Store, private push: PushService, private sseClient: SseClient) {
    }

    get HOST() {
        return getWebHost();
    }

    restoreState() {
        const state = getAuthFromStorage();
        if (null === state) {
            return;
        }
        this.setLoginData(state);
        console.info("Found login data in local storage!");
        this.requestQueue = getRequestQueueFromStorage();
        if (this.requestQueue.length > 0) {
            console.info("Found request queue in local storage!");
            this.startQueueIteration();
        }
    }

    setLoginData({token, refresh_token, mail}: Partial<AuthStorage>) {
        const storage: Partial<AuthStorage> = {};
        storage.token = token ?? this.authStorage?.token;
        storage.refresh_token = refresh_token ?? this.authStorage?.refresh_token;
        storage.mail = mail ?? this.authStorage?.mail;
        if (!isAuthStorage(storage)) {
            void error('Could not cache auth credentials');
            return;
        }
        this.authStorage = storage;
        this.store.login();
        this.sseClient.setTokenCallback(() => this.authStorage?.token);
        this.sseClient.register();
        saveAuthToStorage(storage);
        void this.registerPush();
    }

    async isSessionValid(): Promise<boolean> {
        const response = await this.requestImmediately(
            'GET',
            'api/auth_check',
        );

        return HTTP_OK === response.status;
    }

    async refreshLogin(): Promise<boolean> {
        if (undefined === this.authStorage?.refresh_token) {
            return false;
        }
        const formData = new FormData();
        formData.append('refresh_token', this.authStorage?.refresh_token);
        const response = await this.requestImmediately(
            'POST',
            'api/login_refresh',
            formData,
        );
        if (response.status !== HTTP_OK) {
            return false;
        }
        const data: unknown = await response.json();
        if (!isLoginRefreshResponse(data)) {
            await error('Invalid refresh login response given!');
            return false;
        }
        this.setLoginData({token: data.token});

        return true;
    }

    async signUp(name: string, mail: string, password: string): Promise<void> {
        const response = await this.sendJsonImmediately(
            'POST',
            'signup',
            {name, mail, password},
        );
        if (response.status !== HTTP_OK) {
            await handleErrorResponse(response, 'signing up');
        }
    }

    async signIn(mail: string, password: string): Promise<void> {
        const response = await this.sendJsonImmediately(
            'POST',
            'api/login_check',
            {
                username: mail,
                password: password,
            },
        );
        if (response.status !== HTTP_OK) {
            await handleErrorResponse(response, 'signing in');
        }
        const data: unknown = await response.json();
        if (isLoginResponse(data)) {
            this.setLoginData({...data, mail});

            return;
        }
    }

    logout(): void {
        clearAuthFromStorage();
        localstore.clear();
        this.store.logout();
        this.authStorage = null;
    }

    isAuthenticated(): boolean {
        return null != this.authStorage?.token;
    }

    async registerPush() {
        const pushId = await this.push.getPushId()
        const deviceId = await this.push.getDeviceId();
        if (null === pushId) {
            console.warn('No push id given, cannot register push service!');
            return;
        }
        const formData = new FormData();
        formData.append('push_id', pushId);
        formData.append('device_id', deviceId);
        await this.requestEventually(
            'POST',
            'api/push',
            formData,
        );
    }

    async lookupUsers(search: string) {
        const formData = new FormData();
        formData.append('search', search);
        const response = await this.requestImmediately(
            'POST',
            'api/user/lookup',
            formData,
        );
        if (response.status !== HTTP_OK) {
            await handleErrorResponse(response, 'searching users');
        }

        const data: unknown = await response.json();
        if (!isLookupUserResponse(data)) {
            throw new Error('Invalid user lookup response given!');
        }

        return data;
    }

    async sendJsonImmediately(
        method: HttpMethod,
        url: string,
        data: JsonData,
        headers: HeadersData = {},
    ): Promise<Response> {
        headers['Content-Type'] = 'application/json';

        return await this.requestImmediately(
            method,
            url,
            JSON.stringify(data),
            headers,
        );
    }

    async sendJsonEventually(
        method: HttpMethod,
        url: string,
        data: JsonData,
        headers: HeadersData = {},
        retryStrategy: RetryStrategy = RetryStrategy.RETRY_AND_PERSIST,
    ): Promise<Response> {
        headers['Content-Type'] = 'application/json';

        return await this.requestEventually(
            method,
            url,
            JSON.stringify(data),
            headers,
            retryStrategy,
        );
    }

    private headersWithAuth(headers: HeadersData = {}): HeadersData {
        if (null != this.authStorage?.token) {
            headers['Authorization'] = `Bearer ${this.authStorage?.token}`;
        }

        return headers;
    }

    async requestImmediately(
        method: HttpMethod,
        url: string,
        body?: RequestBody,
        headers?: HeadersData,
    ): Promise<Response> {
        return await fetch(`${this.HOST}/${url}`, {
            method,
            headers: this.headersWithAuth(headers),
            body,
        });
    }

    async requestEventually(
        method: HttpMethod,
        url: string,
        body?: RequestBody,
        headers?: HeadersData,
        retryStrategy: RetryStrategy = RetryStrategy.RETRY_AND_PERSIST,
    ): Promise<Response> {
        return new Promise((resolve) => {
            const shouldPersist = retryStrategy === RetryStrategy.RETRY_AND_PERSIST;
            this.requestQueue.push({
                method,
                url,
                headers,
                body,
                shouldPersist,
                callback: (response: Response) => resolve(response),
            });
            if (shouldPersist) {
                saveRequestQueueToStorage(this.requestQueue);
            }
            this.startQueueIteration();
        });
    }

    startQueueIteration(): void {
        this.iteratingQueuePromise ??= this.iterateQueue();
    }

    async iterateQueue(): Promise<void> {
        const request = this.requestQueue.shift();
        if (undefined === request) {
            this.iteratingQueuePromise = null;
            return;
        }
        let response: Response;
        try {
            response = await this.requestImmediately(
                request.method,
                request.url,
                request.body,
                request.headers,
            );
        } catch (err) {
            this.requestQueue.unshift(request);

            return this.retryLater();
        }
        if (response.status === HTTP_UNAUTHORIZED) {
            if (!await this.isSessionValid() && !await this.refreshLogin()) {
                await this.handleSessionExpired();
                return;
            }
            // If authentication refresh was successful, retry the request
            response = await this.requestImmediately(
                request.method,
                request.url,
                request.body,
                request.headers,
            );
        }
        request.callback?.(response);
        if (request.shouldPersist) {
            saveRequestQueueToStorage(this.requestQueue);
        }
        return this.iterateQueue();
    }

    async handleSessionExpired() {
        console.info("Login data was stale, logging out!");
        clearRequestQueueFromStorage();
        this.requestQueue = [];
        this.logout();
        await router.replace('/');
    }

    async retryLater() {
        // if the browser is offline, wait for it to come back online
        if (!navigator.onLine) {
            await new Promise((resolve) => {
                window.addEventListener('online', resolve, {once: true});
            });
        } else {
            // otherwise, wait a bit
            await sleep(1000);
        }
        return this.iterateQueue();
    }
}
