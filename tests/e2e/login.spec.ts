import { test, expect } from '@playwright/test';
import { BACKEND_URL, PASSWORD, STORE_KEY, USERNAME } from './config';

// Pre-seed the server URL so the login page skips the "Custom server" modal.
async function seedStore(page: import('@playwright/test').Page) {
    await page.addInitScript((args) => {
        localStorage.setItem(args.key, JSON.stringify({ serverUrl: args.url }));
    }, { key: STORE_KEY, url: BACKEND_URL });
}

test('logs in with the test account', async ({ page }) => {
    await seedStore(page);
    await page.goto('/');

    await page.getByRole('textbox', { name: /E-?Mail|Email/i }).fill(USERNAME);
    await page.getByRole('textbox', { name: /Pass(wort|word)/i }).fill(PASSWORD);
    await page.getByRole('button', { name: /^(Anmelden|Sign in|Login)$/i }).click();

    // After login, the dashboard renders the household list.
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 10_000 });
});
