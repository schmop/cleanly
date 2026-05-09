import { State, Store } from '@/store';

// Builds a Store wired around a fresh State so component/integration tests
// don't share mutable global state. Tests can override slices via the patch.
// Getters are intentionally an empty record — the fixture is meant for tests
// that only read/write `state`, not for exercising getter logic.
export function createStoreFixture(patch: Partial<State> = {}): Store {
    const state = Object.assign(new State(), patch);
    const noGetters = {} as ConstructorParameters<typeof Store>[1];
    const store = new Store(state, noGetters);
    store.overrideState(state);
    return store;
}
