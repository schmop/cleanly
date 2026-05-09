import { test, expect } from '@playwright/test';
import { BACKEND_URL, PASSWORD, STORE_KEY, USERNAME } from './config';

// Manual-only E2E. Prerequisite: the test account is a moderator/admin in
// at least one household that has another member and at least one task.
test('moderator marks a task done as another member at a custom time', async ({ page }) => {
    await page.addInitScript((args) => {
        localStorage.setItem(args.key, JSON.stringify({ serverUrl: args.url }));
    }, { key: STORE_KEY, url: BACKEND_URL });

    await page.goto('/');
    await page.getByPlaceholder(/E-?Mail|Email/i).fill(USERNAME);
    await page.getByPlaceholder(/Pass(wort|word)/i).fill(PASSWORD);
    await page.getByRole('button', { name: /(Anmelden|Sign in|Login)/i }).click();

    // Read the logged-in user's id from the store so we can assert the modal
    // didn't silently re-credit the moderator after they picked someone else.
    await page.waitForFunction((key) => {
        try {
            const raw = localStorage.getItem(key);
            return raw != null && (JSON.parse(raw) as { user?: { id?: number } }).user?.id != null;
        } catch {
            return false;
        }
    }, STORE_KEY, { timeout: 10_000 });
    const currentUserId = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        if (raw == null) throw new Error('store missing');
        const parsed = JSON.parse(raw) as { user?: { id?: number } };
        if (parsed.user?.id == null) throw new Error('user.id missing');
        return parsed.user.id;
    }, STORE_KEY);

    // Open the first household and wait for the per-task three-dot menu to render.
    await page.locator('ion-card').first().click();
    const contextMenuButton = page.locator('[id^="task-contextmenu-"]').first();
    await expect(contextMenuButton).toBeVisible({ timeout: 10_000 });

    // Open the per-task popover and pick "Mark done in past".
    await contextMenuButton.click();
    await page.locator('ion-popover ion-item').filter({
        hasText: /Nachträglich erledigen|Mark done in past/i,
    }).click();

    // The MarkDonePastModal renders with the user picker (action-sheet style)
    // and the datetime button. Switch the credited user to a different member.
    const userSelect = page.locator('ion-modal').last().locator('ion-select');
    await expect(userSelect).toBeVisible();
    await userSelect.click();

    const actionSheet = page.locator('ion-action-sheet');
    await expect(actionSheet).toBeVisible();
    // The select defaults to the current user; pick whichever option isn't selected.
    const otherMemberButton = actionSheet
        .locator('button.action-sheet-button:not(.action-sheet-selected):not(.action-sheet-cancel)')
        .first();
    const pickedDisplayName = (await otherMemberButton.textContent())?.trim();
    expect(pickedDisplayName, 'picker must contain at least one non-self option').toBeTruthy();
    await otherMemberButton.click();

    // Confirm — capture both the request payload and the response so we can
    // assert what the UI actually sent over the wire.
    const requestPromise = page.waitForRequest(req =>
        req.url().includes('/api/task/mark-done/') && req.method() === 'POST',
    );
    const responsePromise = page.waitForResponse(resp =>
        resp.url().includes('/api/task/mark-done/'),
    );

    await page.locator('ion-modal').last().getByRole('button', { name: /^(Ok|OK)$/ }).click();

    const request = await requestPromise;
    const response = await responsePromise;

    expect(response.status()).toBe(200);

    const body = request.postDataJSON() as { timestamp?: number, userId?: number };
    expect(typeof body.timestamp).toBe('number');
    // The exact bug we're guarding against: the picker visually showed another
    // member but the request still carried the moderator's own id. The wire
    // payload must either omit `userId` (caller defaulted to self) or carry an
    // id that differs from the logged-in user — never the logged-in user's id.
    expect(body.userId, 'modal must not silently credit the logged-in user').not.toBe(currentUserId);
    expect(typeof body.userId).toBe('number');
});
