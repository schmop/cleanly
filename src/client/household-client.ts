import { Invite } from '@/models/Invite';
import { State } from '@/store';
import { Store } from 'vuex';
import { AuthClient, authClient } from './auth-client';
import store from '../store/index';
import { Todo } from '@/models/Todo';

export class HouseholdClient {
    constructor(private readonly client: AuthClient, private readonly store: Store<State>) {
    }

    async createHousehold(newHouseholdName: string): Promise<boolean> {
        const formData = new FormData();
        formData.append('name', newHouseholdName);
        const response = await this.client.request('api/household/create', {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async dashboardInfo(): Promise<any> {
        const response = await this.client.request('api/dashboard');
        if (response.status !== 200) {
            throw new Error('Could not authenticate, code: ' + response.status);
        }
        this.store.commit('dashboard', await response.json());
    }

    async setHouseholdColor(householdId: number, color: string): Promise<boolean> {
        const formData = new FormData();
        formData.append('color', color);
        const response = await this.client.request(`api/household/${householdId}/color`, {
            body: formData,
            method: 'POST',
        });

        return response.status === 200;
    }

    async joinHousehold(inviteToken: string) {
        const response = await this.client.request(`api/household/join-by-token/${inviteToken}`, {
            method: 'POST',
        });

        return response.status === 200;
    }

    async acceptInvite(invite: Invite) {
        const response = await this.client.request(`api/household/accept-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            throw new Error('Could not accept invite, ' + response.statusText);
        }
        const data = await response.json();
        this.store.commit('joinHousehold', data.household);
    }

    async declineInvite(invite: Invite) {
        const response = await this.client.request(`api/household/decline-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            throw new Error('Could not decline invite, ' + response.statusText);
        }
    }

    async removeHousehold(householdId: number) {
        const response = await this.client.request(`api/household/${householdId}`, {
            method: 'DELETE',
        });

        if (response.status !== 200) {
            console.error('Could not remove household', response.statusText);

            return false;
        }
        
        return true;
    }

    async kickFromHousehold(memberId: number, householdId: number) {
        const response = await this.client.request(`api/household/kick/${householdId}/${memberId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not kick member from household', response.statusText);

            return false;
        }
        
        return true;
    }

    async transferOwnershipTo(memberId: number, householdId: number) {
        const response = await this.client.request(`api/household/transfer-ownership/${householdId}/${memberId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not transfer ownership', response.statusText);

            return false;
        }
        
        return true;
    }

    async leaveHousehold(householdId: number) {
        const response = await this.client.request(`api/household/leave/${householdId}`, {
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
        return await this.client.request(`api/household/invite/${householdId}`, {
            body: formData,
            method: 'POST',
        });
    }

    async fetchInviteLink(householdId: number): Promise<string> {
        const response = await this.client.request(`api/household/invite/generate/${householdId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            throw new Error("Error generating invite link!");
        }

        const data = await response.json();

        return data['token'];
    }

    async updateChecklist(householdId: number, todos: Todo[]): Promise<boolean> {
        const formData = new FormData();
        formData.append('todos', JSON.stringify(todos));
        const response = await this.client.request(`api/household/update-checklist/${householdId}`, {
            method: 'POST',
            body: formData,
        });

        if (response.status !== 200) {
            console.error('Could not update checklist', response.statusText);

            return false;
        }
        
        return true;
    }
}

export const householdClient = new HouseholdClient(authClient, store);