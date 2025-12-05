import { Browser } from "@capacitor/browser";
import { store } from "@/store";

export async function openChangelogBrowser() {
    await Browser.open({url: `${store.state.serverUrl}/changelog`, windowName: 'Changelog - Cleanly'});

    return new Promise((resolve: (value?: unknown) => void) => {
        void Browser.addListener('browserFinished', () => resolve());
    });
}
