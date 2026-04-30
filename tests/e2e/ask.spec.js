import { test, expect } from '@playwright/test';

test.describe('ask page', () => {

  test('has correct page title', async ({ page }) => {
    await page.goto('/ask.html');
    await expect(page).toHaveTitle('Money Fitness – Ask a Question');
  });

  test('answer box is hidden on load', async ({ page }) => {
    await page.goto('/ask.html');
    await expect(page.locator('#answer-output')).toBeHidden();
  });

  test('submitting with a keyword question shows the answer box', async ({ page }) => {
    await page.goto('/ask.html');
    await page.fill('#money-question', 'How do I pay off my credit card debt?');
    await page.locator('#ask-form button[type="submit"]').click();
    await expect(page.locator('#answer-output')).toBeVisible();
  });

  test('answer body has content after a matching question', async ({ page }) => {
    await page.goto('/ask.html');
    await page.fill('#money-question', 'I want to start investing for retirement');
    await page.locator('#ask-form button[type="submit"]').click();
    await expect(page.locator('#answer-body p').first()).toBeVisible();
  });

  test('answer topics label is visible for a matching question', async ({ page }) => {
    await page.goto('/ask.html');
    await page.fill('#money-question', 'How do I budget my expenses?');
    await page.locator('#ask-form button[type="submit"]').click();
    await expect(page.locator('#answer-topics')).toBeVisible();
    await expect(page.locator('#answer-topics')).toContainText('Budgeting');
  });

  test('back to home link navigates correctly', async ({ page }) => {
    await page.goto('/ask.html');
    await page.locator('a[href="index.html"]').first().click();
    await expect(page).toHaveTitle('Money Fitness – Home');
  });

});
