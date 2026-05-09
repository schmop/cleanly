import { test, expect } from '@playwright/test';
import { BACKEND_URL, PASSWORD, STORE_KEY, USERNAME } from './config';

// Smoke flow: log in, open the first household, verify the task list renders.
// Kept minimal — the goal is to detect "the app no longer boots" regressions,
// not to assert against specific task contents that change between runs.
test('login → first household task list visible', async ({ page }) => {
    await page.addInitScript((args) => {
        localStorage.setItem(args.key, JSON.stringify({ serverUrl: args.url }));
    }, { key: STORE_KEY, url: BACKEND_URL });

    await page.goto('/');
    await page.getByRole('textbox', { name: /E-?Mail|Email/i }).fill(USERNAME);
    await page.getByRole('textbox', { name: /Pass(wort|word)/i }).fill(PASSWORD);
    await page.getByRole('button', { name: /^(Anmelden|Sign in|Login)$/i }).click();

    // Dashboard renders each household with its task headings inline. We just
    // need the page to render at least one household (h2) — proves login → load
    // → render didn't blow up.
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible({ timeout: 10_000 });
});
