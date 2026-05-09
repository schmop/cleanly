import { test, expect } from '@playwright/test';

const BACKEND = 'http://192.168.178.150:8000';
const STORE_KEY = 'Cleanly.Store';

// Pre-seed the server URL so the login page skips the "Custom server" modal.
async function seedStore(page: import('@playwright/test').Page) {
    await page.addInitScript((args) => {
        localStorage.setItem(args.key, JSON.stringify({ serverUrl: args.url }));
    }, { key: STORE_KEY, url: BACKEND });
}

test('logs in with the test account', async ({ page }) => {
    await seedStore(page);
    await page.goto('/');

    await page.getByPlaceholder(/E-?Mail|Email/i).fill('lars.richard@rocketmail.com');
    await page.getByPlaceholder(/Pass(wort|word)/i).fill('nopass');
    await page.getByRole('button', { name: /(Anmelden|Sign in|Login)/i }).click();

    // After login, the dashboard renders the household list.
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
});
