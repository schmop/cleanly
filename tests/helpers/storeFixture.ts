import { makeGetters, State, Store } from '@/store';

// Builds a Store wired around a fresh State so component/integration tests
// don't share mutable global state. Tests can override slices via the patch.
export function createStoreFixture(patch: Partial<State> = {}): Store {
    const state = Object.assign(new State(), patch);
    const store = new Store(state, makeGetters);
    store.overrideState(state);
    return store;
}
