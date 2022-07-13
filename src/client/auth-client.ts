import { Store } from 'vuex';
import router from '../router';
import { store, State } from '../store';
import { Invite } from '../models/Invite';
import { Task } from '../models/Task';

export class AuthClient {
    private _token: null | string = null;
    private _refreshToken: null | string = null;
    private _mail: null | string = null;
    private store: Store<State>;
    private get LOCALSTORAGE_STATE_KEY() {
        return 'Cleanly.State';
    }

    get HOST() {
        if (process.env.NODE_ENV === 'production') {
            return "https://cleanly.schmoppo.de";
        }
        //return "http://127.0.0.1:8000";
        return "http://192.168.2.108:8000";
    }

    constructor(store: Store<State>) {
        this.store = store;
    }

    async restoreState(): Promise<void> {
        const stateString = localStorage.getItem(this.LOCALSTORAGE_STATE_KEY);
        if (null != stateString) {
            const state = JSON.parse(stateString);
            this.setLoginData(state);
            if (!await this.authCheck() && !await this.refreshLogin()) {
                this.logout();
            }
        }
    }

    setLoginData({token, refresh_token, mail}: {token?: null|string, refresh_token?: null|string, mail?: null|string}) {
        this._token = token ?? this._token;
        this._refreshToken = refresh_token ?? this._refreshToken;
        this._mail = mail ?? this._mail;
        localStorage.setItem(
            this.LOCALSTORAGE_STATE_KEY, 
            JSON.stringify({ 
                'mail': this._mail, 
                'token': this._token, 
                'refresh_token': this._refreshToken
            })
        );
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
        const token = (await response.json()).token;
        this.setLoginData({token, refresh_token: this._refreshToken});

        return true;
    }

    async signUp(name: string, mail: string, password: string): Promise<void> {
        const formData = new FormData();
        formData.append('_name', name);
        formData.append('_mail', mail);
        formData.append('_password', password);
        const response = await this.request(
            'signup',
            {
                body: formData,
                method: 'POST',
            },
            false
        );
        if (response.status === 200) {
            return;
        }
        let errors = "";

        try {
            errors = (await response.json())['errors'];
        } catch (e) {
            // noop
        }

        throw new Error("Could not sign up\n" + errors);
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
        if (response.status === 200) {
            const data = await response.json();
            if ('token' in data) {
                this.setLoginData({...data, mail});

                return;
            }
        }
        throw new Error('Could not authenticate, code: ' + response.status);
    }

    logout(): void {
        localStorage.removeItem(this.LOCALSTORAGE_STATE_KEY);
        this._mail = null;
        this._token = null;
        this._refreshToken = null;
    }

    isAuthenticated(): boolean {
        return null != this._token;
    }

    getMail(): null | string {
        return this._mail;
    }

    async lookupUsers(search: string) {
        const formData = new FormData();
        formData.append('search', search);
        const response = await this.request('api/user/lookup', {
            body: formData,
            method: 'POST',
        });

        return await response.json();
    }

    private async sendJson(endpoint: string, data: object, init: RequestInit, allowRetry = true): Promise<Response> {
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
            router.replace('/');
        }

        return response;
    }
}

export const authClient = new AuthClient(store);
