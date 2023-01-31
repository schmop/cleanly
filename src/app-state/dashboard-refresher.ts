import { HouseholdClient } from "@/client/household-client";
import { RefresherCustomEvent } from "@ionic/vue";

export class DashboardRefresher {
    constructor(private readonly householdClient: HouseholdClient) {
    }

    async forceReload(event: RefresherCustomEvent) {
        try {
            await this.householdClient.dashboardInfo();
        } finally {
            await event.target.complete();
        }
    }
}
