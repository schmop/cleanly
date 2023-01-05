import { container } from "@/dependency-injection/container";
import { RefresherCustomEvent } from "@ionic/vue";


export async function forceReload(event: RefresherCustomEvent) {
    /** TODO: Find an architecture, that's convenient to use and does not use the container directly */
    await container.getHouseholdClient()?.dashboardInfo();
    await event.target.complete();
}
