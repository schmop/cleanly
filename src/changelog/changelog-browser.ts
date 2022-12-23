import { getWebHost } from "@/client/host";
import { Browser } from "@capacitor/browser";

export async function openChangelogBrowser() {
    await Browser.open({url: `${getWebHost()}/changelog`});

    return new Promise((resolve: (value?: unknown) => void) => {
        Browser.addListener('browserFinished', () => resolve());
    });
}
