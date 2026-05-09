import { defineConfig, devices } from '@playwright/test';

// Manual-only E2E config — never run in CI on the 2 GB self-hosted runner.
// Start the client dev server (`ionic serve`), then either export the
// E2E_BACKEND_URL / E2E_USERNAME / E2E_PASSWORD env vars or drop a `.env.e2e`
// file next to this config (gitignored). See tests/e2e/config.ts for details.
try { process.loadEnvFile('.env.e2e'); } catch { /* file is optional */ }

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    fullyParallel: false,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:8100',
        trace: 'on-first-retry',
        viewport: { width: 414, height: 896 },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
