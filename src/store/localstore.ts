import debounce from "@/common/debounce";
import { Store } from "@/store/index";
import { isState } from "@/store/index.guard";
import { reactive, watch } from "vue";

const STORAGE_KEY = 'Cleanly.Store';

export class Localstore {
    constructor(
        private readonly store: Store,
    ) {
    }

    public init() {
        this.loadFromLocalStorage();
        watch(
            this.store.state,
            debounce(
                () => this.saveToLocalStorage(),
                1000,
                false,
            ),
            {
                deep: true,
            }
        );
    }

    public clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    private loadFromLocalStorage() {
        try {
            const localState: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
            if (!isState(localState)) {
                console.error('Invalid state found in local storage!', localState);
                return;
            }
            this.store.overrideState(reactive(localState));
            console.info("State loaded from device storage!");
        } catch (err) {
            console.warn('No local state found...', err);
        }
    }

    private saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store.state));
    }
}
