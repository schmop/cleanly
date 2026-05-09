// Shared E2E config. Each developer points at their own backend & test
// account via env vars so nothing in the spec files is host-specific.
//
// Required:
//   E2E_BACKEND_URL  e.g. http://192.168.1.50:8000
//   E2E_USERNAME     login email for a seeded test account
//   E2E_PASSWORD     password for that account
//
// .env.e2e in the client/ directory is the suggested place to set these
// (gitignored). Or export them in your shell before running `yarn test:e2e`.

// Avoid pulling in @types/node just for this file; the ambient declaration
// below is enough to read process.env safely.
declare const process: { env: Record<string, string | undefined> };

function required(name: string): string {
    const v = process.env[name];
    if (!v) {
        throw new Error(
            `Missing ${name}. Set it in client/.env.e2e or export it before running yarn test:e2e.`,
        );
    }
    return v;
}

export const BACKEND_URL = required('E2E_BACKEND_URL');
export const USERNAME = required('E2E_USERNAME');
export const PASSWORD = required('E2E_PASSWORD');

export const STORE_KEY = 'Cleanly.Store';
