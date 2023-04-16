import { isAuthStorage } from "@/client/storage/auth-storage.guard";
import { warning } from "@/toast";

/** @see {isAuthStorage} ts-auto-guard:type-guard */
export interface AuthStorage {
    'mail': string,
    'token': string,
    'refresh_token': string,
}

const LOCALSTORAGE_STATE_KEY = 'Cleanly.State';

export function getAuthFromStorage(): AuthStorage|null {
    const stateString = localStorage.getItem(LOCALSTORAGE_STATE_KEY);
    if (null === stateString) {
        console.warn('No cached credentials found.');

        return null;
    }
    const state: unknown = JSON.parse(stateString);
    if (!isAuthStorage(state)) {
        void warning('Invalid format in credential cache found.');
        localStorage.removeItem(LOCALSTORAGE_STATE_KEY);

        return null;
    }

    return state;
}

export function saveAuthToStorage(state: AuthStorage) {
    localStorage.setItem(
        LOCALSTORAGE_STATE_KEY,
        JSON.stringify(state)
    );
}

export function clearAuthFromStorage() {
    localStorage.removeItem(LOCALSTORAGE_STATE_KEY);
}
