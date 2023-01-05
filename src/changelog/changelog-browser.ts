import { getWebHost } from "@/client/host";
import { Browser } from "@capacitor/browser";

export async function openChangelogBrowser() {
    await Browser.open({url: `${getWebHost()}/changelog`, windowName: 'Changelog - Cleanly'});

    return new Promise((resolve: (value?: unknown) => void) => {
        void Browser.addListener('browserFinished', () => resolve());
    });
}
