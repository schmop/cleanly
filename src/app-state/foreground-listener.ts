import { HouseholdClient } from '@/client/household-client';
import { App } from '@capacitor/app';

export class ForegroundListener {
    constructor(
        private householdClient: HouseholdClient,
    ) {
    }

    register(): void {
        App.addListener('resume', () => {
            this.householdClient.dashboardInfo();
        });
    }
}
