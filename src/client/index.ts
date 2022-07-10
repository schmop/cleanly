import { Store } from 'vuex';
import router from '../router';
import { store, State } from '../store';
import { Invite } from '../models/Invite';
import { Task } from '../models/Task';

class Client {
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
        return "http://127.0.0.1:8000";
        //return "http://192.168.2.108:8000";
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

    async editTask(task: Task, taskname: string, icon: string, duration: number) {
        const formData = new FormData();
        formData.append('name', taskname);
        formData.append('icon', icon);
        formData.append('duration', duration.toString());
        const response = await this.request(`api/task/edit/${task.id}`, {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async deleteTask(taskId: string) {
        const response = await this.request(`api/task/${taskId}`, {
            method: 'DELETE',
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

        if (response.status !== 200) {
            console.error('Could not remove household', response.statusText);

            return false;
        }
        
        return true;
    }

    async kickFromHousehold(memberId: number, householdId: number) {
        const response = await this.request(`api/household/kick/${householdId}/${memberId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not kick member from household', response.statusText);

            return false;
        }
        
        return true;
    }

    async leaveHousehold(householdId: number) {
        const response = await this.request(`api/household/leave/${householdId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not leave household', response.statusText);

            return false;
        }
        
        return true;
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