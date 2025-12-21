import { RefresherCustomEvent } from "@ionic/vue";
import { error, showThrownError } from "@/toast";
import { store } from "@/store";
import { container } from "@/dependency-injection/container";


export async function fetchFinanceSummary(event?: RefresherCustomEvent) {
    if (store.state.viewedHousehold === null) {
        void error('Could not fetch finance summary, no household selected!');
        return;
    }
    try {
        store.setFinanceSummary(
            store.state.viewedHousehold,
            await container.getHouseholdClient().fetchFinanceSummary(store.state.viewedHousehold),
        );
    } catch (err) {
        void showThrownError(err, 'fetching the finance summary');
    }
    if (event != null) {
        await event.target.complete();
    }
}