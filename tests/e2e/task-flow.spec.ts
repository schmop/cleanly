import { test, expect } from '@playwright/test';

const BACKEND = 'http://192.168.178.150:8000';
const STORE_KEY = 'Cleanly.Store';

// Smoke flow: log in, open the first household, verify the task list renders.
// Kept minimal — the goal is to detect "the app no longer boots" regressions,
// not to assert against specific task contents that change between runs.
test('login → first household task list visible', async ({ page }) => {
    await page.addInitScript((args) => {
        localStorage.setItem(args.key, JSON.stringify({ serverUrl: args.url }));
    }, { key: STORE_KEY, url: BACKEND });

    await page.goto('/');
    await page.getByPlaceholder(/E-?Mail|Email/i).fill('lars.richard@rocketmail.com');
    await page.getByPlaceholder(/Pass(wort|word)/i).fill('nopass');
    await page.getByRole('button', { name: /(Anmelden|Sign in|Login)/i }).click();

    // Open the first household card; an Ionic ion-list of tasks should render.
    await page.locator('ion-card').first().click();
    await expect(page.locator('ion-list, [data-test="task-list"]').first()).toBeVisible({ timeout: 10_000 });
});
