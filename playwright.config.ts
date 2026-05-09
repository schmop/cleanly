import { defineConfig, devices } from '@playwright/test';

// Manual-only E2E config — never run in CI on the 2 GB self-hosted runner.
// Start the client dev server (`ionic serve`) and ensure the backend is
// reachable at http://192.168.178.150:8000 before invoking `yarn test:e2e`.
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
