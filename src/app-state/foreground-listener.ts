import { HouseholdClient } from '@/client/household-client';
import { Store } from '@/store';
import { App } from '@capacitor/app';

export class ForegroundListener {
    constructor(
        private householdClient: HouseholdClient,
        private store: Store,
    ) {
    }

    register(): void {
        App.addListener('resume', () => {
            if (this.store.state.loggedIn) {
                this.householdClient.dashboardInfo();
            }
        });
    }
}
