import { HouseholdClient } from '@/client/household-client';
import { App } from '@capacitor/app';
import { Store } from '../store/index';

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
