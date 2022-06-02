import { Store } from 'vuex';
import router from '../router';
import { store, State } from '../store';
import { Invite } from '../models/Invite';

class Client {
    private _token: null | string = null;
    private _mail: null | string = null;
    private store: Store<State>;
    private get LOCALSTORAGE_STATE_KEY() {
        return 'Cleanly.State';
    }

    get HOST() {
        return "https://cleanly.schmoppo.de";
        //return "https://127.0.0.1:8000";
        //return "http://192.168.2.102:8000";
    }


    constructor(store: Store<State>) {
        this.store = store;
    }

    async restoreState(): Promise<void> {
        const stateString = localStorage.getItem(this.LOCALSTORAGE_STATE_KEY);
        if (null != stateString) {
            const state = JSON.parse(stateString);
            this._token = state.token;
            this._mail = state.mail;
            const response = await this.request('api/auth_check', {}, false);
            if (response.status !== 200) {
                this._token = null;
                this._mail = null;
            }
        }
    }

    async addNewTask(householdId: number, taskname: string, icon: string, duration: number) {
        const formData = new FormData();
        formData.append('name', taskname);
        formData.append('household_id', householdId.toString());
        formData.append('icon', icon);
        formData.append('duration', duration.toString());
        const response = await this.request('api/task/create', {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    /**
     * @returns false on error, or the new timestamp of the now completed task
     */
    async markTaskComplete(taskId: string): Promise<boolean|number> {
        const response = await this.request(`api/task/mark-done/${taskId}`, {
            method: 'POST',
        });

        if (response.status === 200) {
            return (await response.json()).timestamp as number;
        }

        return false;
    }

    async createHousehold(newHouseholdName: string): Promise<boolean> {
        const formData = new FormData();
        formData.append('name', newHouseholdName);
        const response = await this.request('api/household/create', {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async dashboardInfo(): Promise<any> {
        const response = await this.request('api/dashboard');
        if (response.status !== 200) {
            throw new Error('Could not authenticate, code: ' + response.status);
        }
        this.store.commit('dashboard', await response.json());
    }

    async setHouseholdColor(householdId: number, color: string): Promise<boolean> {
        const formData = new FormData();
        formData.append('color', color);
        const response = await this.request(`api/household/${householdId}/color`, {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async joinHousehold(inviteToken: string) {
        const response = await this.request(`api/household/join-by-token/${inviteToken}`, {
            method: 'POST',
        });

        return response.status === 200;
    }

    async acceptInvite(invite: Invite) {
        const response = await this.request(`api/household/accept-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            throw new Error('Could not accept invite, ' + response.statusText);
        }
        const data = await response.json();
        this.store.commit('joinHousehold', data.household);
    }

    async declineInvite(invite: Invite) {
        const response = await this.request(`api/household/decline-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            throw new Error('Could not decline invite, ' + response.statusText);
        }
    }

    async removeHousehold(householdId: number) {
        const response = await this.request(`api/household/${householdId}`, {
            method: 'DELETE',
        });

        return response.status === 200;
    }

    async invite(householdId: number, ...ids: number[]) {
        const formData = new FormData();
        formData.append('ids', JSON.stringify(ids));
        return await this.request(`api/household/invite/${householdId}`, {
            body: formData,
            method: 'POST',
        });
    }

    async fetchInviteLink(householdId: number): Promise<string> {
        const response = await this.request(`api/household/invite/generate/${householdId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            throw new Error("Error generating invite link!");
        }

        const data = await response.json();

        return data['token'];
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
                this._token = data.token;
                this._mail = mail;
                localStorage.setItem(this.LOCALSTORAGE_STATE_KEY, JSON.stringify({ 'mail': mail, 'token': data.token }));

                return;
            }
        }
        throw new Error('Could not authenticate, code: ' + response.status);
    }

    logout(): void {
        localStorage.removeItem(this.LOCALSTORAGE_STATE_KEY);
        this._mail = null;
        this._token = null;
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

    private async request(endpoint: string, init: RequestInit = {}, allowRetry = true): Promise<Response> {
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

const client = new Client(store);

export default client;