import { HouseholdClient } from '@/client/household-client';
import { Store } from '@/store';
import { App } from '@capacitor/app';

export class ForegroundListener {
    constructor(
        private householdClient: HouseholdClient,
        private store: Store,
    ) {
    }

    async register() {
        await App.addListener('resume', () => {
            if (this.store.state.loggedIn) {
                /** @TODO: catch errors and tell user? */
                void this.householdClient.dashboardInfo();
            }
        });
    }
}
