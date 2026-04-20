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
import { FinanceSummary, FinanceTransaction } from "@/components/HouseholdView/FinancesView/finance-types";
import { isFinanceTransactionResponse } from "@/client/response/FinanceTransactionResponse.guard";
import { HouseholdId } from "@/types";
import { isFinanceSummary } from "@/components/HouseholdView/FinancesView/finance-types.guard";

export class HouseholdClient {
    constructor(private readonly client: AuthClient, private readonly store: Store) {
    }

    async createHousehold(newHouseholdName: string) {
        const formData = new FormData();
        formData.append('name', newHouseholdName);
        const response = await this.client.requestEventually(
            'POST',
            'api/household/create',
            formData,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'creating household');
        }
    }

    async dashboardInfo(): Promise<void> {
        const response = await this.client.requestImmediately(
            'GET',
            'api/dashboard',
        );
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
        this.store.dashboard(data.households, data.user, data.invites, data.checklistSubscriptions);
        this.store.setSettings(data.settings);
    }

    async acceptInvite(invite: Invite) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/accept-invite/${invite.householdId}`,
        );
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
        const response = await this.client.requestEventually(
            'POST',
            `api/household/decline-invite/${invite.householdId}`,
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, "declining invite");
        }
    }

    async removeHousehold(householdId: HouseholdId) {
        const response = await this.client.requestEventually(
            'DELETE',
            `api/household/${householdId}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "removing household");
        }

        return true;
    }

    async kickFromHousehold(memberId: number, householdId: HouseholdId) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/kick/${householdId}/${memberId}`,
        );

        if (response.status !== 200) {
            console.error('Could not kick member from household', response.statusText);

            return false;
        }

        return true;
    }

    async changePrivilege(memberId: number, householdId: HouseholdId, level: PrivilegeLevel) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/privilege/${householdId}/${memberId}/${level}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "changing privileges");
        }
    }

    async leaveHousehold(householdId: HouseholdId) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/leave/${householdId}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "leaving household");
        }
    }

    async moveHousehold(householdId: HouseholdId, moveAfterId: HouseholdId | null) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/${householdId}/move`,
            {moveAfterId},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "reordering households");
        }
    }

    async retrieveStars(householdId: HouseholdId) {
        const response = await this.client.requestImmediately(
            'GET',
            `api/household/${householdId}/stars`,
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, "fetching stars");
        }
        const data: unknown = await response.json();
        if (!isStarResponse(data)) {
            throw new Error('Invalid star response given!');
        }

        this.store.addStars(householdId, data);
    }

    async invite(householdId: HouseholdId, ...ids: number[]) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/invite/${householdId}`,
            {ids},
        );
        if (response.status !== 200) {
            await handleErrorResponse(response, "inviting members");
        }
    }

    async updateChecklist(checklistUuid: string, events: TodoEvent[]) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/checklist/${checklistUuid}/update`,
            {events},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "updating the checklist");
        }
    }

    async createChecklist(householdId: HouseholdId) {
        const response = await this.client.requestEventually(
            'PUT',
            `api/household/${householdId}/checklist/add`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "creating the checklist");
        }
    }

    async renameChecklist(checklistUuid: string, name: string) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/checklist/${checklistUuid}/rename`,
            {name},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "renaming the checklist");
        }
    }

    async moveChecklist(checklistUuid: string, moveAfterUuid: string|null) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/checklist/${checklistUuid}/move`,
            {moveAfterUuid},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "reordering the checklist");
        }
    }

    async deleteChecklist(checklistUuid: string) {
        const response = await this.client.requestEventually(
            'DELETE',
            `api/household/checklist/${checklistUuid}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "deleting the checklist");
        }
    }

    async subscribeToChecklist(checklistUuid: string) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/checklist/${checklistUuid}/subscribe`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "subscribing to the checklist");
        }
    }

    async unsubscribeFromChecklist(checklistUuid: string) {
        const response = await this.client.requestEventually(
            'POST',
            `api/household/checklist/${checklistUuid}/unsubscribe`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "unsubscribing from the checklist");
        }
    }

    async setReassignmentStrategy(householdId: HouseholdId, reassignmentStrategy: string) {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/reassignment-strategy/${householdId}`,
            {reassignmentStrategy},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, "changing the reassignment strategy");
        }
    }

    async setWebhook(householdId: HouseholdId, url: string): Promise<WebhookResponse> {
        const response = await this.client.sendJsonEventually(
            'POST',
            `api/household/webhook/${householdId}`,
            {webhook_url: url},
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

    async addTransaction(householdId: HouseholdId, transaction: FinanceTransaction): Promise<void> {
        const response = await this.client.sendJsonEventually(
            'PUT',
            `api/household/${householdId}/finance/transaction/add`,
            {transaction},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'adding finance transaction');
        }
    }

    async deleteTransaction(householdId: number, transaction: FinanceTransaction): Promise<void> {
        const response = await this.client.requestEventually(
            'DELETE',
            `api/household/${householdId}/finance/transaction/${transaction.uuid}`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'deleting finance transaction');
        }
    }

    async updateTransaction(householdId: number, transaction: FinanceTransaction): Promise<void> {
        const response = await this.client.sendJsonEventually(
            'PUT',
            `api/household/${householdId}/finance/transaction/${transaction.uuid}`,
            {transaction},
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'updating finance transaction');
        }
    }

    async getTransactions(householdId: HouseholdId): Promise<FinanceTransaction[]> {
        const response = await this.client.requestImmediately(
            'GET',
            `api/household/${householdId}/finance/transactions`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'fetching finance transactions');
        }
        const data: unknown = await response.json();
        if (!isFinanceTransactionResponse(data)) {
            throw new Error('Invalid finance transaction response received!');
        }
        return data.transactions;
    }

    async fetchFinanceSummary(householdId: HouseholdId): Promise<FinanceSummary> {
        const response = await this.client.requestImmediately(
            'GET',
            `api/household/${householdId}/finance/summary`,
        );

        if (response.status !== 200) {
            await handleErrorResponse(response, 'fetching finance summaries');
        }
        const data: unknown = await response.json();
        if (!isFinanceSummary(data)) {
            throw new Error('Invalid finance summary response received!');
        }
        return data;
    }
}
