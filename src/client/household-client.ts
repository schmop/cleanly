import { Invite } from '@/models/Invite';
import { AuthClient } from './auth-client';
import { TodoEvent } from '@/models/TodoEvent';
import { Store } from '@/store';
import { error } from '@/toast';
import { isDashboardInfo } from '@/models/DashboardInfo.guard';
import { PrivilegeLevel } from '@/models/HouseholdPrivilege';

export class HouseholdClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {}

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
            error("Could not authenticate!");
            throw new Error('Could not authenticate, code: ' + response.status);
        }
        const data = await response.json();
        if (!isDashboardInfo(data)) {
            error("Invalid dashboard data given, is your app out of date?");
            console.error('Invalid data given:', data);
            throw new Error('Invalid dashboard data given!');
        }
        this.store.dashboard(data.households, data.user, data.invites);
        this.store.setSettings(data.settings);
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
        this.store.joinHousehold(data.household);
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

    async changePrivilege(memberId: number, householdId: number, level: PrivilegeLevel) {
        const response = await this.client.request(`api/household/privilege/${householdId}/${memberId}/${level}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            console.error('Could not change privileges', response.statusText);

            return false;
        }

        return true;
    }

    async leaveHousehold(householdId: number) {
        const response = await this.client.request(`api/household/leave/${householdId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            try {
                const data = await response.json();
                if (typeof data.reason !== 'string') {
                    throw 'No reason known';
                }
                throw new Error(data.reason);
            } catch (err: any) {
                if (typeof err.message === 'string') {
                    throw err;
                }
                throw new Error('Could not leave household');
            }
        }
    }

    async retrieveStars(householdId: number) {
        const response = await this.client.request(`api/household/${householdId}/stars`);
        if (response.status !== 200) {
            console.error('Could not fetch stars', response.statusText);

            return null;
        }

        this.store.addStars(householdId, await response.json());
    }

    async invite(householdId: number, ...ids: number[]) {
        return await this.client.sendJson(
            `api/household/invite/${householdId}`,
            {ids},
            {method: 'POST'}
        );
    }

    async updateChecklist(householdId: number, events: TodoEvent[]): Promise<boolean> {
        const response = await this.client.sendJson(
            `api/household/update-checklist/${householdId}`,
            {events},
            {method: 'POST'},
        );

        if (response.status !== 200) {
            console.error('Could not update checklist', response.statusText);

            return false;
        }

        return true;
    }
}
