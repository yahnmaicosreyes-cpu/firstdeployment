import { test, expect } from '@playwright/test';

test.describe('home page', () => {

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Money Fitness/);
  });

  test('simulator form is visible on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sim-form')).toBeVisible();
    await expect(page.locator('#sim-question')).toBeVisible();
  });

  test('simulator output is hidden on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sim-output')).toBeHidden();
  });

  test('submitting a question reveals the output', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'I just got my first paycheck and I have a bank account');
    await page.locator('#sim-form button[type="submit"]').click();
    await expect(page.locator('#sim-output')).toBeVisible();
  });

  test('output shows exactly 3 option cards', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'how do I cash my paycheck?');
    await page.locator('#sim-form button[type="submit"]').click();
    await expect(page.locator('#sim-body .sim-option')).toHaveCount(3);
  });

  test('Why? button toggles explanation content', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'I got my first paycheck, what do I do?');
    await page.locator('#sim-form button[type="submit"]').click();
    const btn = page.locator('.why-btn').first();
    const content = page.locator('.why-content').first();
    await expect(content).toBeHidden();
    await btn.click();
    await expect(content).toBeVisible();
    await btn.click();
    await expect(content).toBeHidden();
  });

  test('no bank account question puts check cashing first and marks it recommended', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'I have no bank account and just got my first paycheck');
    await page.locator('#sim-form button[type="submit"]').click();
    const firstCard = page.locator('#sim-body .sim-option').first();
    await expect(firstCard).toHaveClass(/sim-option--recommended/);
    await expect(firstCard).toContainText('cashing');
  });

  test('has a bank + need cash puts cash-at-bank first', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'I have a bank account and need cash today');
    await page.locator('#sim-form button[type="submit"]').click();
    const firstCard = page.locator('#sim-body .sim-option').first();
    await expect(firstCard).toContainText('Cash it');
  });

  test('routing banner appears when a recommendation is made', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'I have no bank account');
    await page.locator('#sim-form button[type="submit"]').click();
    await expect(page.locator('.sim-routed')).toBeVisible();
  });

  test('char count updates as user types', async ({ page }) => {
    await page.goto('/');
    await page.fill('#sim-question', 'hello');
    await expect(page.locator('#sim-char-count')).toContainText('495 characters left');
  });

});
