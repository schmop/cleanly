import { getWebHost } from '@/client/host';
import { handleErrorResponse } from "@/client/response/handle-error-response";
import { isLoginRefreshResponse } from "@/client/response/LoginRefreshResponse.guard";
import { isLoginResponse } from "@/client/response/LoginResponse.guard";
import { isLookupUserResponse } from "@/client/response/LookupUserResponse.guard";
import { SseClient } from "@/client/sse-client";
import { AuthStorage } from "@/client/storage/AuthStorage";
import { isAuthStorage } from "@/client/storage/AuthStorage.guard";
import { PushService } from '@/push';
import router from '@/router';
import { Store } from '@/store';
import { error, warning } from "@/toast";

export class AuthClient {
    private _token: null|string = null;
    private _refreshToken: null|string = null;
    private _mail: null|string = null;

    private get LOCALSTORAGE_STATE_KEY() {
        return 'Cleanly.State';
    }

    constructor(private store: Store, private push: PushService, private sseClient: SseClient) {
    }

    get HOST() {
        return getWebHost();
    }

    async restoreState(): Promise<void> {
        const stateString = localStorage.getItem(this.LOCALSTORAGE_STATE_KEY);
        if (null === stateString) {
            console.warn('No cached credentials found.');

            return;
        }
        const state: unknown = JSON.parse(stateString);
        if (!isAuthStorage(state)) {
            await warning('Invalid format in credential cache found.');
            localStorage.removeItem(this.LOCALSTORAGE_STATE_KEY);

            return;
        }
        this.setLoginData(state);
        console.info("Found login data in local storage!");
        if (!await this.authCheck() && !await this.refreshLogin()) {
            console.info("Login data was stale, logging out!");
            this.logout();
        }
    }

    setLoginData({token, refresh_token, mail}: Partial<AuthStorage>) {
        this._token = token ?? this._token;
        this._refreshToken = refresh_token ?? this._refreshToken;
        this._mail = mail ?? this._mail;
        const storage = {
            'mail': this._mail,
            'token': this._token,
            'refresh_token': this._refreshToken
        };
        if (!isAuthStorage(storage)) {
            void error('Could not cache auth credentials');
            return;
        }
        localStorage.setItem(
            this.LOCALSTORAGE_STATE_KEY,
            JSON.stringify(storage)
        );
        this.store.login();
        // Todo: resolve circular dependency
        this.sseClient.setTokenCallback(() => this._token);
        this.sseClient.register();
        void this.registerPush();
    }

    async authCheck(): Promise<boolean> {
        const response = await this.request('api/auth_check', {}, false);

        return 200 === response.status;
    }

    async refreshLogin(): Promise<boolean> {
        if (null === this._refreshToken) {
            return false;
        }
        const formData = new FormData();
        formData.append('refresh_token', this._refreshToken);
        const response = await this.request('api/login_refresh', {
            method: 'POST',
            body: formData,
        }, false);
        if (response.status !== 200) {
            return false;
        }
        const data: unknown = await response.json();
        if (!isLoginRefreshResponse(data)) {
            await error('Invalid refresh login response given!');
            return false;
        }
        this.setLoginData({token: data.token, refresh_token: this._refreshToken});

        return true;
    }

    async signUp(name: string, mail: string, password: string): Promise<void> {
        const response = await this.sendJson(
            'signup',
            {name, mail, password},
            {method: 'POST'},
            false
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, 'signing up');
        }
    }

    async signIn(mail: string, password: string): Promise<void> {
        const response = await this.sendJson(
            'api/login_check',
            {
                username: mail,
                password: password,
            },
            {
                method: 'POST',
            },
            false
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, 'signing in');
        }
        const data: unknown = await response.json();
        if (isLoginResponse(data)) {
            this.setLoginData({...data, mail});

            return;
        }
    }

    logout(): void {
        localStorage.removeItem(this.LOCALSTORAGE_STATE_KEY);
        this.store.logout();
        this._mail = null;
        this._token = null;
        this._refreshToken = null;
    }

    isAuthenticated(): boolean {
        return null != this._token;
    }

    getMail(): null|string {
        return this._mail;
    }

    getToken(): null|string {
        return this._token;
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
        await this.request('api/push', {
            body: formData,
            method: 'POST',
        });
    }

    async lookupUsers(search: string) {
        const formData = new FormData();
        formData.append('search', search);
        const response = await this.request('api/user/lookup', {
            body: formData,
            method: 'POST',
        });
        if (response.status !== 200) {
            await handleErrorResponse(response, 'searching users');
        }

        const data: unknown = await response.json();
        if (!isLookupUserResponse(data)) {
            throw new Error('Invalid user lookup response given!');
        }

        return data;
    }

    async sendJson(endpoint: string, data: object, init: RequestInit, allowRetry = true): Promise<Response> {
        if (!(init.headers instanceof Headers)) {
            init.headers = new Headers(init.headers ?? {});
        }
        init.headers.append('Content-Type', 'application/json');
        init.body = JSON.stringify(data);

        return await this.request(endpoint, init, allowRetry);
    }

    async request(endpoint: string, init: RequestInit = {}, allowRetry = true): Promise<Response> {
        if (!(init.headers instanceof Headers)) {
            init.headers = new Headers(init.headers ?? {});
        }
        if (null != this._token) {
            init.headers.append("Authorization", `Bearer ${this._token}`);
        }

        const response = await fetch(`${this.HOST}/${endpoint}`, init);
        if (response.status === 401 && allowRetry) {
            await this.restoreState();
            if (this._token != null) {
                return await this.request(endpoint, init, false);
            }
            await router.replace('/');
        }

        return response;
    }
}
