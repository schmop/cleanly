import { Store } from '@/store';

export class ColorschemeListener {
    constructor(
        private store: Store,
    ) {
    }

    register(): void {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        this.store.setDarkmode(mediaQueryList.matches);

        mediaQueryList.addEventListener('change', (event) => {
            this.store.setDarkmode(event.matches);
        });
    }
}
