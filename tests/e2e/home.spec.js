import { test, expect } from '@playwright/test';

test.describe('home page', () => {

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Money Fitness – Home');
  });

  test.describe('assessment wizard', () => {

    test('step 1 — next button is disabled on load', async ({ page }) => {
      await page.goto('/');
      const next = page.locator('#next-1');
      await expect(next).toBeDisabled();
    });

    test('step 1 — selecting a user type enables next button', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-who="highschool"]').click();
      await expect(page.locator('#next-1')).toBeEnabled();
    });

    test('step 1 → step 2 — clicking next shows goal chips', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-who="college"]').click();
      await page.locator('#next-1').click();
      await expect(page.locator('#step-2')).toBeVisible();
      await expect(page.locator('#goal-grid .goal-chip').first()).toBeVisible();
    });

    test('step 2 — next button disabled until a goal is selected', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-who="adult"]').click();
      await page.locator('#next-1').click();
      await expect(page.locator('#next-2')).toBeDisabled();
      await page.locator('#goal-grid .goal-chip').first().click();
      await expect(page.locator('#next-2')).toBeEnabled();
    });

    test('full wizard flow — completes and shows result card', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-who="highschool"]').click();
      await page.locator('#next-1').click();
      await page.locator('#goal-grid .goal-chip').first().click();
      await page.locator('#next-2').click();

      await expect(page.locator('#step-3')).toBeVisible();
      await expect(page.locator('#result-card h3')).toContainText('High School');
    });

    test('back navigation — step 3 back returns to step 2', async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-who="adult"]').click();
      await page.locator('#next-1').click();
      await page.locator('#goal-grid .goal-chip').first().click();
      await page.locator('#next-2').click();
      await page.locator('[data-goto-step="2"]').click();

      await expect(page.locator('#step-2')).toBeVisible();
      await expect(page.locator('#step-3')).toBeHidden();
    });

  });

  test.describe('home ask form', () => {

    test('submitting a question shows the answer box', async ({ page }) => {
      await page.goto('/');
      await page.fill('#home-money-question', 'How do I start budgeting?');
      await page.locator('#home-ask-form button[type="submit"]').click();
      await expect(page.locator('#home-answer-output')).toBeVisible();
    });

    test('answer body contains at least one paragraph', async ({ page }) => {
      await page.goto('/');
      await page.fill('#home-money-question', 'I need help with savings');
      await page.locator('#home-ask-form button[type="submit"]').click();
      await expect(page.locator('#home-answer-body p').first()).toBeVisible();
    });

    test('nav link to ask page works', async ({ page }) => {
      await page.goto('/');
      await page.locator('nav a[href="ask.html"]').click();
      await expect(page).toHaveTitle('Money Fitness – Ask a Question');
    });

  });

});
