import { handleErrorResponse } from "@/client/response/handle-error-response";
import { isInviteResponse } from "@/client/response/InviteResponse.guard";
import { isStarResponse } from "@/client/response/StarResponse.guard";
import { isDashboardInfo } from '@/models/DashboardInfo.guard';
import { PrivilegeLevel } from '@/models/HouseholdPrivilege';
import { Invite } from '@/models/Invite';
import { TodoEvent } from '@/models/TodoEvent';
import { Store } from '@/store';
import { error } from '@/toast';
import { AuthClient } from './auth-client';
import { WebhookResponse } from './response/WebhookResponse';
import { isWebhookResponse } from './response/WebhookResponse.guard';

export class HouseholdClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async createHousehold(newHouseholdName: string) {
        const formData = new FormData();
        formData.append('name', newHouseholdName);
        const response = await this.client.request('api/household/create', {
            body: formData,
            method: 'POST',
        });

        if (response.status !== 200) {
            await handleErrorResponse(response, 'creating household');
        }
    }

    async dashboardInfo(): Promise<void> {
        const response = await this.client.request('api/dashboard');
        if (response.status !== 200) {
            void error("Could not authenticate!");
            throw new Error(`Could not authenticate, code: ${response.status}`);
        }
        const data: unknown = await response.json();
        if (!isDashboardInfo(data)) {
            void error("Invalid dashboard data given, is your app out of date?");
            console.error('Invalid data given:', data);
            throw new Error('Invalid dashboard data given!');
        }
        this.store.dashboard(data.households, data.user, data.invites);
        this.store.setSettings(data.settings);
    }

    async acceptInvite(invite: Invite) {
        const response = await this.client.request(`api/household/accept-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            await handleErrorResponse(response, "accepting invite");
        }
        const data: unknown = await response.json();
        if (!isInviteResponse(data)) {
            throw new Error('Invalid invite response received!');
        }
        this.store.joinHousehold(data.household);
    }

    async declineInvite(invite: Invite) {
        const response = await this.client.request(`api/household/decline-invite/${invite.householdId}`, {
            method: 'POST',
        });
        if (response.status !== 200) {
            await handleErrorResponse(response, "declining invite");
        }
    }

    async removeHousehold(householdId: number) {
        const response = await this.client.request(`api/household/${householdId}`, {
            method: 'DELETE',
        });

        if (response.status !== 200) {
            await handleErrorResponse(response, "removing household");
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
            await handleErrorResponse(response, "changing privileges");
        }
    }

    async leaveHousehold(householdId: number) {
        const response = await this.client.request(`api/household/leave/${householdId}`, {
            method: 'POST',
        });

        if (response.status !== 200) {
            await handleErrorResponse(response, "leaving household");
        }
    }

    async retrieveStars(householdId: number) {
        const response = await this.client.request(`api/household/${householdId}/stars`);
        if (response.status !== 200) {
            await handleErrorResponse(response, "fetching stars");
        }
        const data: unknown = await response.json();
        if (!isStarResponse(data)) {
            throw new Error('Invalid star response given!');
        }

        this.store.addStars(householdId, data);
    }

    async invite(householdId: number, ...ids: number[]) {
        const response = await this.client.sendJson(
            `api/household/invite/${householdId}`,
            {ids},
            {method: 'POST'}
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, "inviting members");
        }
    }

    async updateChecklist(householdId: number, events: TodoEvent[]) {
        const response = await this.client.sendJson(
            `api/household/update-checklist/${householdId}`,
            {events},
            {method: 'POST'},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "updating the checklist");
        }
    }

    async setWebhook(householdId: number, url: string): Promise<WebhookResponse> {
        const response = await this.client.sendJson(
            `api/household/webhook/${householdId}`,
            {webhook_url: url},
            {method: 'POST'},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'setting webhook');
        }

        const data: unknown = await response.json();
        if (!isWebhookResponse(data)) {
            throw new Error('Invalid response given when setting webhook!');
        }

        return data;
    }
}
